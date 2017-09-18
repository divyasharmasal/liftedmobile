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

        <CourseEditor courses={this.state.courses} />
      </div>
    );
  }
}

export class CourseEditor extends Component {
  renderRows = courses => {
    return courses.map(course => 
      <CourseRowEditor course={course} />
    );
  }


  render(){
    return (
      <div class="editor">
        <table class="course_table pure-table">
          <thead>
            <td>Name</td>
            <td>Cost</td>
            <td>CPD</td>
            <td>Level</td>
            <td>Format</td>
            <td>Dates</td>
            <td class="edit_cell">Edit</td>
          </thead>

          <tbody>
            {this.renderRows(this.props.courses)}
          </tbody>
        </table>
      </div>
    );
  }
}


class CourseRowEditor extends Component{
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
      <tr>
        <td data-title="Name">{course.name}</td>
        <td data-title="Cost">{"$" + course.cost.toFixed(2)}</td>
        <td data-title="CPD">{this.format_cpd(course.cpd)}</td>
        <td data-title="Level">{course.level}</td>
        <td data-title="Format">{course.format}</td>
        <td data-title="Dates">{this.format_dates(course.start_dates)}</td>
        <td class="edit_cell" data-title="Edit">
          <button class="pure-button pure-button-primary edit_button">
            <img src="/static/cms/dist/images/pencil.png" alt="edit"/>
          </button>
          <button class="pure-button button-red delete_button">
            <img src="/static/cms/dist/images/trash.png" alt="delete"/>
          </button>
        </td>
      </tr>
    );
  }
}
