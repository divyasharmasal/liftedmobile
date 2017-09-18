import { h, Component } from "preact";
import { authFetch } from "../../lib/fetch";
import { sortCoursesByDate } from "../../../../lib/js/courses";
import { renderLoader } from "../../../../lib/js/loader_anim";

export class CoursesPage extends Component {
  constructor(props){
    super(props);
    this.searchInput = null;
    this.state = {
      courses: null,
    };
  }


  componentWillMount = () => {
    authFetch("/cms/get_courses/").then(response => {
      response.json().then(courses => {
        // sort by date
        courses = sortCoursesByDate(courses)
        this.setState({ courses });
      });
    });
  }


  handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleSearch(event.target.value);
    }
  }


  handleSearch = text => {
    text = text.trim();
    if (text.length > 0){
    }
  }


  render(){
    if (!this.state.courses){
      return renderLoader();
    }

    return(
      <div class="course_manager">
        <h1>Manage Courses</h1>

        <div class="search pure-form">
          <input 
            ref={search => {this.searchInput = search}}
            onKeyPress={this.handleSearchKeyPress}
            class="search_input" type="text" />
          <button 
            onClick={() => {
              this.handleSearch(this.searchInput.value);
            }}
            class="search_button pure-button pure-button-primary">
            Search
          </button>
        </div>

        <CourseList courses={this.state.courses} />
      </div>
    );
  }
}


export class CourseList extends Component {
  render(){
    return (
      <div>
        {this.props.courses.map(course => <CourseEditor course={course} />)}
      </div>
    );
  }
}


class CourseEditor extends Component{
  format_cpd = cpd => {
    if (cpd.is_private){
      return "Private";
    }
    else{
      return cpd.points.toFixed(0);
    }
  }


  format_dates = dates => {
    return dates.join(", ") + " 2017";
  }


  render(){
    const course = this.props.course;
    return(
      <div class="editor">
        <div class="name pure-u-1">
          <input type="text" 
            placeholder="Name"
            value={course.name}>
          </input>
        </div>
        <div class="pure-u-1">
          <input type="text" 
            placeholder="(missing URL)"
            value={course.url}>
          </input>
        </div>

        <div class="pure-u-1-2 pure-u-sm-1-3">
          Cost: {"$" + course.cost.toFixed(2)}
        </div>

        <div class="pure-u-1-2 pure-u-sm-1-3">
          CPD: {this.format_cpd(course.cpd)}
        </div>

        <br />

        <div class="pure-u-1-2 pure-u-sm-1-3">
          Level: {course.level}
        </div>

        <div class="pure-u-1-2 pure-u-sm-1-3">
          Format: {course.format}
        </div>

        <br />

        <div class="pure-u-1">
          Dates: {this.format_dates(course.start_dates)}
        </div>

        <div class="buttons">

          <button class="pure-button button-green save_button">
            <img src="/static/cms/dist/images/tick.png" alt="save"/>
          </button>

          <button class="pure-button pure-button-primary edit_button">
            <img src="/static/cms/dist/images/pencil.png" alt="edit"/>
          </button>

          <button class="pure-button button-red delete_button">
            <img src="/static/cms/dist/images/trash.png" alt="delete"/>
          </button>

        </div>
      </div>
    );
  }
}
