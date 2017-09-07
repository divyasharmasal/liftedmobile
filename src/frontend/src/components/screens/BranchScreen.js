import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../Question';
import { authFetch } from '../fetch';
import {
  Screen, 
  createCoursesUrl, 
  renderCourseFoundNotice,
  renderStartOver,
} from './Screen';
import { Courses } from '../Courses';

export {BranchScreen};


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
    // The IDs in the database start from 1, so increment the selectedAnswer
    // indices which start from 0
    const verticalId = this.props.selectedAnswers[0][0] + 1;
    const categoryId = this.props.selectedAnswers[1][0] + 1;

    if (selectedNeeds == null){
      authFetch(createCoursesUrl(verticalId, categoryId, null))
        .then(response => {
          response.json().then(courses => {
            if (courses.length > 0){
              this.storeCourses(courses, false);
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
    let selectedAnswers = this.props.selectedAnswers;
    const storedSelectedAnswers = sessionStorage.getItem("selectedAnswers");

    // Use answers stored in session storage instead of state if 
    // state.selectedanswers == {}
    if (Object.keys(selectedAnswers).length == 0 && storedSelectedAnswers){
      selectedAnswers = JSON.parse(storedSelectedAnswers);
    }

    if ((!selectedAnswers && !storedSelectedAnswers) ||
         (Object.keys(selectedAnswers).length === 0 
           && !storedSelectedAnswers)){
      route("/");
    }
    else{
      this.fetchAndStoreCourses(null);
    }
  }


  handleAnswerSelect = (selectedNeeds, isMultiQn) => {
    let selectedAnswers = this.props.selectedAnswers;
    selectedAnswers[this.props.qnNum] = selectedNeeds;
    this.fetchAndStoreCourses(selectedNeeds);

    // Store selectedAnswers to sessionStorage and the state
    sessionStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));
  }


  render = () => {
    const courseTableRef = courseTable => {this.courseTable = courseTable};
    const courses = <Courses courses={this.state.courses}
                             courseTableRef={courseTableRef}
                             unPadCourses={this.unPadCourses} />;

    // find out which item the user selected in the previous screen
    const preSelected = this.props.selectedAnswers[this.props.qnNum];

    let qnData = JSON.parse(JSON.stringify(this.props.qnData));
    //qnData.text = "...or choose more goals if you wish.";

    const courseNotice = (
      <div class="course_notice pure-u-1">
        {renderCourseFoundNotice(this.state.courses, this.padCourses)}
      </div>
    );

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
        <div key={0} class={"notification pure-u-1 " + flash}>
          <a href="#courses"><p>{courseText}</p></a>
        </div>
      );
    }

    return (
      <div class="pure-g">
        <a name="top" />
        {/*courseNotice*/}
        {notification}
        <div class="pure-u-1">
          {renderStartOver()}
          <a class="top_nav_link full_review"
            onClick={() => {route("/test")}}>
            Full review ➜
          </a>
        </div>
        <div class="pure-u-1">
          <Question
            clickToShow={false}
            isMultiQn={true}
            preSelected={preSelected}
            scrollDownMsg={false}
            useTiles={true}
            handleAnswerSelect={this.handleAnswerSelect}
            qnData={qnData} 
          />
        </div>

        {this.state.courses &&
          <div class="rec_courses pure-u-1" ref={courses => this.courses = courses}>
            <a name="courses" />
            <h1>Recommended courses</h1>
            {courses}
          </div>
        }
      </div>
    );
  }
}

