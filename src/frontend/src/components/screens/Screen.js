import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../Question';
import { authFetch } from '../fetch';

export { 
  Screen, 
  createCoursesUrl, 
  renderCourses, 
  renderLoader,
  renderStartOver,
};

const renderStartOver = () => {
  return (
    <a class="top_nav_link start_over" onClick={() => { route("/") }}>
      ⟲ start over
    </a>
  );
}

const renderLoader = () => {
  return (
    <div class="pure-g">
      <div class="pure-u-1">
        <div class="spinner">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
        </div>
      </div>
    </div>
  );
}


const createCoursesUrl = (verticalId, categoryId, needIds) => {
  const prefix = "/courses?";
  const vert = "v=" + encodeURIComponent(verticalId);
  const cat = "&c=" + (categoryId ? encodeURIComponent(categoryId) : "any");
  const needs = "&n=" + (needIds ? encodeURIComponent(needIds.join(",")) : "any");
  return prefix + vert + cat + needs;
}


const renderCourses = (courses, courseTableRef, unPadCourses) => {
  const format_cpd = cpd => {
    if (cpd.is_private){
      return "Private";
    }
    else{
      return cpd.points.toFixed(0) + " points";
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
        <p>Here's what we could find based on available courses.</p>
      ];
    }

    result = (
      <div>
        {isTailored}
      {/*
      <p class="for_better_results">
        <a class="scroll_link" 
          href="#top" onClick={unPadCourses}>
          For better results, answer more questions &#10548;</a></p>,
      */}
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
      </div>
    );
  }

  return result;
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
