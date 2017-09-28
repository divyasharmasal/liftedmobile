import { h, Component } from "preact";
import { findDOMNode } from "preact-compat";
import { route } from "preact-router";

import { Topbar } from "./Topbar";
import { CourseList } from "./CourseList";
import { CourseSorter } from "./CourseSorter";

import { renderLoader } from "../screens/Screen";
import { authFetch } from "../../lib/fetch";


const sortKeys = {
  date: 0,
  cpd: 1,
  cost: 2,
}


const reduce = (prevState, action) => {
  switch (action.type){
    case "SET_COURSES":
      return { courses: action.data };
  default:
      return prevState;
  }
}


export class CourseBrowser extends Component{
  constructor(props){
    super(props);
    this.state = {
      courses: null,
    };
  }


  componentWillMount = () => {
    const url = this.genCourseListUrl("date", "desc", "all", 1, 2, 0);
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
    const base = "/course_browse?";
    const sortByParam = "&s=" + sortKeys[sortBy].toString();

    return base + sortByParam;
  }


  handleSearch = query => {
    console.log(query);
  }


  dispatch = action => {
    console.log("Dispatch: " + action.type);
    this.setState(prevState => reduce(prevState, action));
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
                  <CourseSorter />
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

