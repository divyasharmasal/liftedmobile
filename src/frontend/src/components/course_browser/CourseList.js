import { h, Component } from "preact";
import { CourseListEntry } from "./CourseListEntry";

export class CourseList extends Component{
  render() {
    return(
      <div class="courses">
        {this.props.courses.map(
          course => <CourseListEntry course={course} />)
        }
        {this.props.children}
      </div>
    );
  }
}
