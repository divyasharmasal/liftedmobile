import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../Question';
import { authFetch } from '../fetch';
import {
  Screen, 
  createCoursesUrl, 
  renderCourseFoundNotice,
} from './Screen';

import { Courses } from '../Courses';

export {WhyLearnScreen};

class WhyLearnScreen extends Screen{
  constructor(props){
    super(props);
    this.state = {
      courses: null
    };
  }


  componentWillMount = () => {
    if (!this.state.selectedAnswers && !sessionStorage.getItem("selectedAnswers")){
      route("/");
    }
    else{
      let selectedAnswers = this.props.selectedAnswers;
      // The IDs in the database start from 1, so increment the selectedAnswer
      // indices which start from 0
      let verticalId = selectedAnswers[0][0] + 1;
      let categoryId = selectedAnswers[1][0] + 1;

      authFetch(createCoursesUrl(verticalId, categoryId)).then(response => {
        response.json().then(courses => {
          if (courses.length > 0){
            this.setState({
              courses: {
                courses: courses,
                tailored: true,
              },
            });
          }
          else{
            // Nothing for this vertical category, so return less-than
            // tailored results.
            authFetch(createCoursesUrl(verticalId)).then(response => {
              response.json().then(courses => {
                this.setState({
                  courses: {
                    courses: courses,
                    tailored: false,
                  },
                });
              });
            });
          }
        });
      });
    }
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
    const notice = renderCourseFoundNotice(this.state.courses, this.padCourses);

    const courseNotice = (
      <div class="course_notice pure-u-1">
        {notice}
      </div>
    );

    return (
      <div class="pure-g">
        <a name="top" />
        {/*courseNotice*/}
        <div class="pure-u-1 why_learn_qn">
          <Question
            isMultiQn={false}
            useTiles={true}
            scrollDownMsg={true}
            handleAnswerSelect={this.handleAnswerSelect}
            qnData={this.props.qnData} 
          />
        </div>

        <a name="courses" />

        <div class="rec_courses pure-u-1" ref={courses => this.courses = courses}>
          <h1>Recommend courses</h1>
          {courses}
        </div>
      </div>
    );
  }
}

