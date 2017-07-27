import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from './Question';
import { authFetch } from './fetch';

export { 
  BranchScreen,
  WhyLearnScreen, 
  WhatCompetencyScreen, 
  JobScreen, 
};


const createCoursesUrl = (verticalId, categoryId, needIds) => {
  let prefix = "/courses?";
  let vert = "v=" + encodeURIComponent(verticalId);
  let cat = "&c=" + (categoryId ? encodeURIComponent(categoryId) : "any");
  let needs = "&n=" + (needIds ? encodeURIComponent(needIds.join(",")) : "any");
  return prefix + vert + cat + needs;
}


const renderCourses = (courses, courseTableRef, unPadCourses) => {
  const format_cpd = cpd => {
    if (cpd.is_private){
      return "Private CPD points";
    }
    else{
      return cpd.points.toFixed(0) + " CPD points";
    }
  }


  const format_cost = cost => {
    if (cost % 1.0 > 0){
      return "$" + cost.toFixed(0);
    }
    else{
      return "$" + cost.toFixed(2);
    }
  }

  const format_dates = dates => {
    return dates.join(", ") + " 2017";
  }

  let result;
  if (!courses){
    result = (
      <div class="load1">
        <div class="loader">Loading courses...</div>;
      </div>
    );
  }
  else if (courses.courses.length === 0){
    result = (
      <div class="pure-u-1">
        <p>No courses found.</p>
      </div>
    );
  }
  else{
    let rows = [];
    courses.courses.forEach((course, i) => {
      rows.push(
        <tr key={i}>
          <td data-title="Name">{course.name}</td>
          <td data-title="Cost">{format_cost(course.cost)}</td>
          <td data-title="CPD">{format_cpd(course.cpd)}</td>
          <td data-title="Level">{course.level}</td>
          <td data-title="Format">{course.format}</td>
          <td data-title="Dates">{format_dates(course.start_dates)}</td>
        </tr>
      );
    });

    let isTailored;
    if (!courses.tailored){
      isTailored = [
        <p>We didn't find any courses that matched every option you've 
        selected.</p>,
        <p>Not to worry, you may like the following courses.</p>
      ];
    }

    result = [
      isTailored,
      <p class="for_better_results">
        <a class="scroll_link" 
          href="#top" onClick={unPadCourses}>
          For better results, answer more questions &#10548;</a></p>,
      <table class="pure-table course_table"
        ref={courseTableRef}>
        <thead>
          <td>Name</td>
          <td>Cost</td>
          <td>CPD</td>
          <td>Level</td>
          <td>Format</td>
          <td>Dates (2017)</td>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    ];
  }

  return result;
}

const renderCourseFoundNotice = (courses, padCourses) => {
  if (courses && courses.courses.length > 0){
    let c = courses.courses.length == 1 ? "course" : "courses";
    return (
      <p>
        <a 
          onClick={padCourses}
          class="scroll_link"
          href="#courses">
          We've found {courses.courses.length} {c} for you &#10549; 
        </a>
      </p>
    );
  }
  else{
    return [];
  }
}

// Screen parent class
class Screen extends Component{
  componentDidMount = () => {
    window.scrollTo(0, 0);
  }

  componentWillMount = () => {
    if (!this.state.selectedAnswers && 
      // Route to / if there are no selectedAnswers in state
      // or in sessionStorage
        !sessionStorage.getItem("selectedAnswers")){
      route("/");
    }
  }

  handleAnswerSelect = (index, isMultiQn) => {
    // Let the App handle the answer selection and route to the next
    // screen
    this.props.handleAnswerSelect(this.props.qnNum, index, isMultiQn, 
      this.routeToNextScreen);
  }


  routeToNextScreen = () => {
    // Route to nextScreenPath
    route(this.props.nextScreenPath);
  }
}


class BranchScreen extends Screen{
  storeCourses = (courses, tailored) => {
    this.setState({
      courses: {
        courses: courses, 
        tailored: tailored,
      },
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
          this.storeCourses(courses, true);
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
    this.fetchAndStoreCourses(selectedAnswers);
  }


  handleAnswerSelect = (selectedNeeds, isMultiQn) => {
    let selectedAnswers = this.props.selectedAnswers;
    selectedAnswers[this.props.qnNum - 1] = selectedNeeds;
    this.fetchAndStoreCourses(selectedAnswers);

    // Store selectedAnswers to sessionStorage and the state
    sessionStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));

    //this.props.handleAnswerSelect(this.props.qnNum, index, isMultiQn, 
      //this.routeToNextScreen);
  }

  padCourses = () => {
    // Make the course list to take up the whole screen
    this.courses.style["minHeight"] = "100vh";
  }

  unPadCourses = () => {
    this.courses.style["minHeight"] = "initial";
  }


  render = () => {
    let courseTableRef = courseTable => {this.courseTable = courseTable};
    let courses = renderCourses(this.state.courses, courseTableRef, 
      this.unPadCourses);

    // find out which item the user selected in the previous screen
    const preSelected = this.props.selectedAnswers[this.props.qnNum - 1];

    let qnData = this.props.qnData;
    qnData.text = "...or choose more goals if you wish.";

    let notice = renderCourseFoundNotice(this.state.courses, this.padCourses);
    let courseNotice = (
      <div class="course_notice pure-u-1">
        {notice}
      </div>
    );

    return(
      <div class="pure-g">
        <a name="top" />
        {courseNotice}
        <div class="take_test_prompt pure-u-1 pure-u-md-10-24">
          <h1>Take a full learning needs diagnostic test.</h1>
          <a class="take_test_button">Take the test</a>
        </div>

        <div class="pure-u-md-2-24"></div>

        <div class="question_small pure-u-1 pure-u-md-10-24">
          <Question
            isMultiQn={true}
            preSelected={preSelected}
            scrollDownMsg={false}
            handleAnswerSelect={this.handleAnswerSelect}
            qnData={qnData} 
          />
        </div>
        <div class="courses">
          <a name="courses" />
          <div class="pure-u-1">
            <h2>Courses we recommend</h2>
          </div>
          <div class="pure-u-1" ref={courses => this.courses = courses}>
            <a name="courses" />
            <div class="courses">
              {courses}
            </div>
          </div>
        </div>
      </div>
    );
  }
}


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
    let courseTableRef = courseTable => {this.courseTable = courseTable};
    let courses = renderCourses(this.state.courses, courseTableRef, 
                                this.unPadCourses);
    let notice = renderCourseFoundNotice(this.state.courses, this.padCourses);

    let courseNotice = (
      <div class="course_notice pure-u-1">
        {notice}
      </div>
    );

    return (
      <div class="pure-g">
        <a name="top" />
        {courseNotice}
        <div class="pure-u-1 why_learn_qn">
          <Question
            isMultiQn={false}
            scrollDownMsg={true}
            handleAnswerSelect={this.handleAnswerSelect}
            qnData={this.props.qnData} 
          />
        </div>
        <div class="courses">
          <a name="courses" />
          <div class="pure-u-1">
            <h2>Courses we recommend</h2>
          </div>
          <div class="pure-u-1" ref={courses => this.courses = courses}>
            {courses}
          </div>
        </div>
      </div>
    );
  }
}


class WhatCompetencyScreen extends Screen{
  constructor(props){
    super(props);

    if (!this.props.selectedAnswers || 
        Object.keys(this.props.selectedAnswers).length == 0){
      route("/");
    }
    else{
      let selectedVertical = this.props.selectedAnswers[0][0];
      let options = [];
      this.props.qnData.options[selectedVertical].forEach(x => {
        options.push({text: x});
      });
      this.state = {
        qnData: { 
          text: this.props.qnData.text,
          options: options,
        }
      };
    }
  }


  render = () => {
    if (!this.state.qnData){
      return <p>Loading...</p>;
    }
    return (
      <div className="pure-g">
        <div className="pure-u-1">
					<Question
						isMultiQn={false}
						handleAnswerSelect={this.handleAnswerSelect}
						qnData={this.state.qnData} 
					/>
				</div>
      </div>
    );
  }
}


class JobScreen extends Screen{
  constructor(props){
    super(props);
    sessionStorage.removeItem("selectedAnswers");
  }


  render = () => {
    return (
      <div className="pure-g">
        <div className="pure-u-1">
					<Question
            qnNum={this.props.qnNum}
						isMultiQn={false}
						handleAnswerSelect={this.handleAnswerSelect}
						qnData={this.props.qnData} 
					/>
          <div class="preload_lato_bold">&nbsp;</div>
				</div>
      </div>
    );
  }
}

