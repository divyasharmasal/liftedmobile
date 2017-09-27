import { h, Component } from "preact";
import { CourseListEntry } from "./CourseListEntry";

export class CourseList extends Component{
  render() {
    return(
      <div class="courses">
        <CourseListEntry />
        <CourseListEntry />
        <CourseListEntry />
      </div>
    );
  }
}
