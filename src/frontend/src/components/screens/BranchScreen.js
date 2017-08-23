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
    let shouldFlash = false;
    if (this.state.courses){
      if (this.state.courses.courses.length !== courses.length){
        shouldFlash = true;
      }
    }

    this.setState({
      courses: {
        courses: courses, 
        tailored: tailored,
      },
      flash:shouldFlash,
    }, () => {
      setTimeout(() => {
        this.setState({
          flash:false,
        });
      }, 500);
    });
  }


  fetchAndStoreCourses = (selectedAnswers) => {
    // The IDs in the database start from 1, so increment the selectedAnswer
    // indices which start from 0
    let verticalId = selectedAnswers[0][0] + 1;
    let categoryId = selectedAnswers[1][0] + 1;
    let selectedNeeds = selectedAnswers[2].map(x => x+1);

    authFetch(createCoursesUrl(verticalId, categoryId, selectedNeeds)).then(response => {
      // authFetch courses with verticalId, categoryId, and needIds
      response.json().then(courses => {
        if (courses.length > 0){
          this.storeCourses(courses, selectedNeeds.length > 0);
        }
        else{
          // if there are no courses, fetch with categoryId = "any"
          authFetch(createCoursesUrl(verticalId, null, selectedNeeds)).then(response => {
            response.json().then(courses => {
              if (courses.length > 0){
                this.storeCourses(courses, false);
              }
              else{
                // if there are still no courses, fetch with categoryId and needIds = "any"
                authFetch(createCoursesUrl(verticalId, null, null)).then(response => {
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


  componentWillMount = () => {
    let selectedAnswers = this.props.selectedAnswers;
    let storedSelectedAnswers = sessionStorage.getItem("selectedAnswers");

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
      this.fetchAndStoreCourses(selectedAnswers);
    }
  }


  handleAnswerSelect = (selectedNeeds, isMultiQn) => {
    let selectedAnswers = this.props.selectedAnswers;
    selectedAnswers[this.props.qnNum - 1] = selectedNeeds;
    this.fetchAndStoreCourses(selectedAnswers);

    // Store selectedAnswers to sessionStorage and the state
    sessionStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));
  }

  padCourses = () => {
    // Make the course list to take up the whole screen
    this.courses.style["minHeight"] = "100vh";
  }

  unPadCourses = () => {
    this.courses.style["minHeight"] = "initial";
  }


  render = () => {
    const courseTableRef = courseTable => {this.courseTable = courseTable};
    const courses = <Courses courses={this.state.courses}
                             courseTableRef={courseTableRef}
                             unPadCourses={this.unPadCourses} />;

    // find out which item the user selected in the previous screen
    const preSelected = this.props.selectedAnswers[this.props.qnNum - 1];

    let qnData = JSON.parse(JSON.stringify(this.props.qnData));
    qnData.text = "...or choose more goals if you wish.";

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
        </div>
        <div class="take_test_prompt pure-u-1 pure-u-md-10-24">
          <a href={this.props.nextScreenPath} 
             class="take_test_button">
            Click here for a holistic learning review
          </a>
          <p>It takes less than 8 minutes.</p>
        </div>

        <div class="pure-u-md-2-24"></div>

        <div class="question_small pure-u-1 pure-u-md-10-24">
          <Question
            clickToShow={true}
            isMultiQn={true}
            preSelected={preSelected}
            scrollDownMsg={false}
            useTiles={true}
            handleAnswerSelect={this.handleAnswerSelect}
            qnData={qnData} 
          />
        </div>


        <div class="rec_courses pure-u-1" ref={courses => this.courses = courses}>
          <a name="courses" />
          <h1>Recommended courses</h1>
          {courses}
        </div>
      </div>
    );
  }
}

