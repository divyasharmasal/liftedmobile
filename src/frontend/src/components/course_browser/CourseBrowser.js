import { h, Component } from "preact";
import { findDOMNode } from "preact-compat";
import { route } from "preact-router";

import { Topbar } from "./Topbar";
import { CourseList } from "./CourseList";

import { renderLoader } from "../screens/Screen";
import { authFetch } from "../../lib/fetch";

export class CourseBrowser extends Component{
  constructor(props){
    super(props);
    this.state = {
      courses: null,
    };
  }


  componentWillMount = () => {
    const url = "/course_browser";
    //authFetch(url).then(
  }


  handleSearch = query => {
    console.log(query);
  }


  render(){
    //if (this.state.courses == null){
      //return (renderLoader());
    //}
    //else if (this.state.courses.length === 0){
      //return(
        //<div class="pure-g">
          //<div class="pure-u-1">
            //<p>Error: no courses available</p>
          //</div>
        //</div>
      //);
    //}

    return(
      <div>
        <Topbar handleSearch={this.handleSearch} />

        <div class="pure-g">
          <div class="pure-u-1">
            <h1>CPD Courses</h1>
            <CourseList />
          </div>
        </div>
      </div>
    );
  }
}

