import { h, Component } from "preact";
import { CourseListEntry } from "./CourseListEntry";
import { renderLoader } from "../screens/Screen";

export class CourseList extends Component{
  render() {
      console.log(this.props.loading);
    return(
      <div class="courses">
        {this.props.loading ?
          <div class="course_row">
            {renderLoader()}
          </div>
          :
          <div>
            {this.props.courses.map(
              course => <CourseListEntry course={course} />)
            }
          </div>
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
