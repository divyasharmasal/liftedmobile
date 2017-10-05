import { h, Component } from "preact";
import { findDOMNode } from "preact-compat";
import { route } from "preact-router";

import { Topbar } from "./Topbar";
import { CourseList } from "./CourseList";
import { CourseListOpts } from "./course_list_opts/CourseListOpts";

import { renderLoader } from "../screens/Screen";
import { authFetch } from "../../lib/fetch";


const sortKey = {
  "Date": 0,
  "CPD points": 1,
  "Cost": 2,
};


const directionKey = {
  "asc": 0,
  "desc": 1,
};


export class CourseBrowser extends Component{
  constructor(props){
    super(props);
    this.state = {
      courses: null,
    };
  }


  componentWillMount = () => {
    const url = this.genCourseListUrl("Date", "desc", "all", 1, 2, 0);
    this.fetchAndSetCourses(url);
  }


  fetchAndSetCourses = url => {
    console.log(url);
    authFetch(url).then(response => {
      response.json().then(courses => {
        this.dispatch({
          type: "SET_COURSES",
          data: courses,
        });
      });
    });
  }


  genCourseListUrl = (sortBy, sortOrder, cpdType, startDate, endDate, page) => {
    console.log(sortOrder);
    const base = "/course_browse?";
    const sortByParam = "&s=" + sortKey[sortBy].toString();
    const sortOrderParam = "&o=" + directionKey[sortOrder].toString();

    return base + sortByParam + sortOrderParam;
  }


  handleSearch = query => {
    console.log(query);
  }


  reduce = (prevState, action) => {
    switch (action.type){
      case "SET_COURSES":
        return { courses: action.data };
    default:
        return prevState;
    }
  }


  dispatch = action => {
    console.log("Dispatch: " + action.type);
    this.setState(prevState => this.reduce(prevState, action));
  }


  handleSort = sortBy => {
    const url = this.genCourseListUrl(sortBy.field, sortBy.direction, "all", 1, 2, 0);
    this.fetchAndSetCourses(url);
  }


  handleDateFilter = dateRange => {
    console.log(dateRange);
  }


  render(){
    if (this.state.courses == null){
      return renderLoader();
    }

    return(
      <div>
        <Topbar handleSearch={this.handleSearch} />

        <div class="pure-g">
          <div class="pure-u-1">
            { this.state.courses.length > 0 ?
              <div>
                <CourseList courses={this.state.courses}>
                  <CourseListOpts 
                    handleSort={this.handleSort}
                    handleDateFilter={this.handleDateFilter}
                  />
                </CourseList>
              </div>
            :
              <p>No courses available.</p>
            }
          </div>
        </div>
      </div>
    );
  }
}

