import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../Question';
import { authFetch } from '../../lib/fetch';
import { Screen, } from './Screen';
import { renderLoader } from "../../../../../../lib/js/loader_anim";
import { Courses } from '../Courses';
import { storeSelectedOpts } from "../../lib/store";


const createCoursesUrl = (verticalId, categoryId, needIds) => {
  const prefix = "/course_recs?";
  const vert = "v=" + encodeURIComponent(verticalId);
  const cat = "&c=" + encodeURIComponent(categoryId);
  if (needIds){
    const needs = "&n=" + encodeURIComponent(needIds.join(","));
    return prefix + vert + cat + needs;
  }
  else{
    return prefix + vert + cat;
  }
}


export class BranchScreen extends Screen {
  storeCourses = courses => {
		const shouldFlash = this.state.courses && 
			this.state.courses.length !== courses.length;

    this.setState({
      courses: courses, 
      flash: shouldFlash,
    }, () => {
      setTimeout(() => {
        this.setState({
          flash: false,
        });
      }, 600);
    });
  }


  fetchAndStoreCourses = (selectedNeeds) => {
    const verticalId = this.props.vertical;
    const categoryId = this.props.compCategory;

    if (selectedNeeds == null){
      authFetch(createCoursesUrl(verticalId, categoryId))
        .then(response => {
          response.json().then(courses => {
            this.storeCourses(courses);
          });   
        });
    }
    else{
      authFetch(createCoursesUrl(verticalId, categoryId, selectedNeeds))
        .then(response => {
          response.json().then(courses => {
            this.storeCourses(courses);
          });
        });
    }
  }


  componentWillMount = () => {
    if (this.props.selectedOptions){
      this.fetchAndStoreCourses(this.props.selectedOptions.needs);
    }
  }


  redirectToNext = () => {
    const verticalId = this.props.selectedOptions["vertical"]
    route(this.props.nextScreenPaths[verticalId]);
  }


  handleOptionSelect = selectedNeeds => {
    let selectedOptions = this.props.selectedOptions;
    selectedOptions[this.props.name] = selectedNeeds;

    // Store selectedOptions to sessionStorage and the state
    storeSelectedOpts(selectedOptions);
    this.fetchAndStoreCourses(selectedNeeds);

    this.props.handleOptionSelect(this.props.name, selectedNeeds);
  }


  render = () => {
    if (this.state.courses == null){
      return renderLoader();
    }

    const courseTableRef = courseTable => {this.courseTable = courseTable};
    // find out which item the user already selected
    //const preSelected = this.props.selectedOptions[this.props.name];

    let qnData = JSON.parse(JSON.stringify(this.props.qnData));
    //qnData.text = "...or choose more goals if you wish.";

    let notification;
    
    if (this.state.courses && this.state.courses.length > 0){
      const numCourses = this.state.courses.length;
      let courseText;
      if (numCourses != 1){
        courseText = "Found " + numCourses + " courses.";
      }
      else{
        courseText = "Found " + numCourses + " course.";
      }

      const flash = this.state.flash ? "flash" : "";

      notification= (
        <div key={0} class={"no_user_select notification pure-u-1 " + flash}>
          <a href="#courses"><p>{courseText}</p></a>
        </div>
      );
    }

    return (
      <div class="pure-g">
        <a name="top" />
        {notification}
        <div className="pure-u-1-3">
          <a class="no_user_select top_nav_link home" 
             onClick={() => { route("/") }}>
            <img src="/static/app/dist/images/home.png" />
            Home
          </a>
        </div>
        <div className="pure-u-1-3 start_over_parent">
          {this.renderStartOver()}
        </div>
        <div className="pure-u-1-3">
          <a class="top_nav_link full_review"
            onClick={this.redirectToNext}>
            Full review ➜
          </a>
        </div>
        <div class="pure-u-1">
          <Question
            isMultiQn={true}
            //preSelected={preSelected}
            scrollDownMsg={false}
            useTiles={true}
            handleOptionSelect={this.handleOptionSelect}
            qnData={qnData} 
          />
        </div>

        {this.state.courses.length > 0 ?
          <div class="rec_courses" ref={courses => this.courses = courses}>
            <a name="courses" />
            <div class="pure-u-1">
              <h1>Recommended courses</h1>
            </div>
            <Courses courses={this.state.courses}
              courseTableRef={courseTableRef}
              unPadCourses={this.unPadCourses} />
          </div>
        :
          <div class="rec_courses no_recs pure-u-1">
            <p>
              Could not recommend any courses based on the selections
              you made.
            </p>
            <p>
              <a href="/analysis">Click here</a> to try again.
            </p>
          </div>
        }
      </div>
    );
  }
}

