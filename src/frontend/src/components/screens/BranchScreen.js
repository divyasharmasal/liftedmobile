import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../Question';
import { authFetch } from '../../lib/fetch';
import { Screen, } from './Screen';
import { Courses } from '../Courses';
import { storeSelectedOpts } from "../../lib/store";

export {BranchScreen};


const createCoursesUrl = (verticalId, categoryId, needIds) => {
  const prefix = "/courses?";
  const vert = "v=" + encodeURIComponent(verticalId);
  const cat = "&c=" + (categoryId ? encodeURIComponent(categoryId) : "any");
  const needs = "&n=" + (needIds ? encodeURIComponent(needIds.join(",")) : "any");
  return prefix + vert + cat + needs;
}


class BranchScreen extends Screen {
  storeCourses = (courses, tailored) => {
		const shouldFlash = this.state.courses && 
			this.state.courses.courses.length !== courses.length;

    this.setState({
      courses: {
        courses: courses, 
        tailored: tailored,
      },
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
    // The IDs in the database start from 1, so increment the
    // selectedOption indices which start from 0
    const verticalId = this.props.selectedOptions["vertical"];
    const categoryId = this.props.selectedOptions["comp_category"];

    if (selectedNeeds == null){
      authFetch(createCoursesUrl(verticalId, categoryId))
        .then(response => {
          response.json().then(courses => {
            if (courses.length > 0){
              this.storeCourses(courses, true);
            }
            else{
              authFetch(createCoursesUrl(verticalId))
                .then(response => {
                  response.json().then(courses => {
                    this.storeCourses(courses, false);
                  });
                });
            }
          });   
        });
    }
    else{
      authFetch(createCoursesUrl(verticalId, categoryId, selectedNeeds))
        .then(response => {
          // authFetch courses with verticalId, categoryId, and needIds
          response.json().then(courses => {
            if (courses.length > 0){
              this.storeCourses(courses, selectedNeeds.length > 0);
            }
            else{
              // if there are no courses, fetch with categoryId = "any"
              authFetch(createCoursesUrl(verticalId, null, selectedNeeds))
                .then(response => {
                  response.json().then(courses => {
                    if (courses.length > 0){
                      this.storeCourses(courses, false);
                    }
                    else{
                      // if there are still no courses, fetch with
                      // categoryId and needIds = "any"
                      authFetch(createCoursesUrl(verticalId, null, null))
                        .then(response => {
                          response.json().then(courses => {
                            this.storeCourses(courses, false);
                          });
                        });
                    }
                  });
                });
            }
          });
        });
    }
  }


  componentWillMount = () => {
    if (this.props.selectedOptions){
      this.fetchAndStoreCourses(null);
    }
  }


  handleOptionSelect = (selectedNeeds, isMultiQn) => {
    let selectedOptions = this.props.selectedOptions;
    selectedOptions[this.props.name] = selectedNeeds;

    // Store selectedOptions to sessionStorage and the state
    storeSelectedOpts(selectedOptions);
    this.fetchAndStoreCourses(selectedNeeds);
  }


  render = () => {
    const courseTableRef = courseTable => {this.courseTable = courseTable};
    // find out which item the user already selected
    const preSelected = this.props.selectedOptions[this.props.name];

    let qnData = JSON.parse(JSON.stringify(this.props.qnData));
    //qnData.text = "...or choose more goals if you wish.";

    let notification;
    
    if (this.state.courses){
      const numCourses = this.state.courses.courses.length;
      let courseText;
      if (numCourses > 1){
        courseText = "Found " + numCourses + " courses!";
      }
      else{
        courseText = "Found " + numCourses + " course!";
      }

      let flash = "";
      if (this.state.flash){
        flash = "flash";
      }

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
        <div class="pure-u-1">
          {this.renderStartOver()}
          <a class="top_nav_link full_review"
            onClick={() => {route("/test")}}>
            Full review ➜
          </a>
          <Question
            isMultiQn={true}
            preSelected={preSelected}
            scrollDownMsg={false}
            useTiles={true}
            handleOptionSelect={this.handleOptionSelect}
            qnData={qnData} 
          />
        </div>

        {this.state.courses &&
          <div class="rec_courses" ref={courses => this.courses = courses}>
            <a name="courses" />
            <div class="pure-u-1">
              <h1>Recommended courses</h1>
            </div>
            <Courses courses={this.state.courses}
              courseTableRef={courseTableRef}
              unPadCourses={this.unPadCourses} />;
          </div>
        }
      </div>
    );
  }
}

