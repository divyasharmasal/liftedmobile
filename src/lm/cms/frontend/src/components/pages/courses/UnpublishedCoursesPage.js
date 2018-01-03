import { h, Component } from "preact";
import { authFetch } from "../../../lib/js/fetch";
import { renderLoader } from "../../../lib/js/loader_anim";
import format from "date-fns/format";

import { CourseEditor } from "./CourseEditor";


export class UnpublishedCoursesPage extends Component {
  componentWillMount = () => {
    authFetch("/cms/get_unpublished_courses_data/").then(response => {
      response.json().then(data => {

        // sort by spider_name
        data.courses = data.courses.sort((a, b) => {
          const x = a.spider_name.toUpperCase();
          const y = b.spider_name.toUpperCase();

          if (x < y) {
            return -1;
          }

          if (x > y) {
            return 1;
          }

          return 0;
        });

        this.setState({ 
          courses: data.courses, 
          levels: data.levels,
          formats: data.formats,
          verticals: data.verticals,
        });
      });
    });
  }


  handleDelete = index => {
    let courses = this.state.courses;
    courses.splice(index, 1);
    this.setState({ courses });
  }


  render(){
    if (!this.state.courses){
      return renderLoader();
    }

    return(
      <div class="course_manager">
        <h1>Unpublished Courses</h1>
        {
          this.state.courses.map((course, index) => 
            <CourseEditor 
              index={index}
              course={course} 
              unpublished={true}
              levels={this.state.levels}
              formats={this.state.formats}
              verticals={this.state.verticals}
              handleDelete={() => {
                this.handleDelete(course);
              }}
            />
          )
        }
      </div>
    );
  }
}
