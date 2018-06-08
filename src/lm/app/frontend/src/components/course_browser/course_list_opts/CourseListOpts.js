import { h, Component } from "preact";
import { CourseSorter } from "./CourseSorter";
import { CourseDateFilter } from "./CourseDateFilter";

export class CourseListOpts extends Component{
  render(){
    return(
      <div class="course_list_opts">
        <div class="content">
          <CourseSorter 
            onSort={this.props.handleSort}
          />
          <CourseDateFilter 
            onDateRangeSelect={this.props.handleDateFilter}
            onDateRangeClear={this.props.handleDateFilterClear}
          />
          {/*
            <span class="label">Topic</span>
            <img class="expand" src="/static/app/dist/images/courses/sort_show.png" />
          */}
        </div>
      </div>
    );
  }
}

