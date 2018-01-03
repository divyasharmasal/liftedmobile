import { h, Component } from "preact";
import { authFetch } from "../../../lib/js/fetch";
import { sortCoursesByDateRange } from "../../../../../../../lib/js/courses";
import { renderLoader } from "../../../lib/js/loader_anim";
import { CourseEditor } from "./CourseEditor";


export class PublishedCoursesPage extends Component {
  componentWillMount = () => {
    authFetch("/cms/get_published_courses_data/").then(response => {
      response.json().then(data => {
        // sort by date
        //data.courses = sortCoursesByDateRange(data.courses)

        this.setState({ 
          courses: data.courses,
          levels: data.levels,
          formats: data.formats,
          verticals: data.verticals,
        });
      });
    });
  }


  handleSearchKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.handleSearch(event.target.value);
    }
  }


  handleSearch = text => {
    //text = text.trim();
    //if (text.length > 0){
    //}
  }


  handleDelete = index => {
    let courses = this.state.courses;
    courses.splice(index, 1);
    this.setState({ courses });
  }


  handleAddCourseClick = () => {
    const newCourse = {
      isNew: true,
      name: "",
      url: "",
      cost: {
        cost: null,
        isVarying: false,
      },
      cpd: {points: null, is_private: false, is_tbc: false},
      format: null,
      level: null,
      date_ranges: [],
      spider_name: null,
      is_manually_added: true,
      lifted_keys: [],
    };

    let courses = this.state.courses;
    courses.splice(0, 0, newCourse);
    this.setState({ courses });
  }


  render(){
    if (!this.state.courses){
      return renderLoader();
    }

    return(
      <div class="course_manager">
        <div class="pure-u-1 pure-u-md-3-5">
          <h1>Published Courses</h1>
        </div>
        <div class="pure-u-1 pure-u-md-2-5 add_course">
          <button 
            class="add_course_btn pure-button pure-button-primary"
            onClick={this.handleAddCourseClick}
          >
            + Add Course
          </button>
        </div>

        {/*
        <div class="search pure-form">
          <input 
            ref={search => {this.searchInput = search}}
            onKeyUp={this.handleSearchKeyUp}
            class="search_input" type="text" />
          <button 
            onClick={() => {
              this.handleSearch(this.searchInput.value);
            }}
            class="search_button pure-button pure-button-primary">
            Search
          </button>
        </div>
        */}

        <div>
          {this.state.courses.map((course, index) => 
            <CourseEditor 
              index={index}
              course={course} 
              levels={this.state.levels}
              formats={this.state.formats}
              verticals={this.state.verticals}
              handleDelete={() => {this.handleDelete(index) }}
            />
          )}
        </div>
      </div>
    );
  }
}
