import { h, Component } from "preact";
import { CourseSorter } from "./CourseSorter";
import { CourseDateFilter } from "./CourseDateFilter";

export class CourseListOpts extends Component{
  render(){
    return(
      <div class="course_list_opts">
        <div class="content">
          <div class="pri">
            <CourseSorter 
              onSort={this.props.handleSort}
            />
          </div>
          <div class="pri">
            <CourseDateFilter 
              onDateRangeSelect={this.props.handleDateFilter}
              onDateRangeClear={this.props.handleDateFilterClear}
            />
          </div>
          {/*
          <div class="pri">
            <span class="label">Topic</span>
            <img class="expand" src="/static/app/dist/images/courses/sort_show.png" />
          </div>
          */}
        </div>
      </div>
    );
  }
}

