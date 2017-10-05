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
        {this.props.courses.length == 0 &&
            <div>
              <p>No courses found.</p>
              <p><a href="#" onClick={this.props.handleClearAll}>Click here</a> to reset.</p>
            </div>

        }
      </div>
    );
  }
}
