import { h, Component } from "preact";
import { findDOMNode } from "preact-compat";
import { route } from "preact-router";

import { Topbar } from "./Topbar";
import { CourseList } from "./CourseList";
import { CourseListOpts } from "./course_list_opts/CourseListOpts";

import { renderLoader } from "../screens/Screen";
import { authFetch } from "../../lib/fetch";

import format from "date-fns/format";


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
    this.defaultDateRange = {
      startDate: new Date(2017, 0, 1),
      endDate: new Date(2017, 11, 31),
    };

    this.state = {
      courses: null,
      sortBy: {
        field: "Date",
        direction: "asc",
      },
      dateRange: this.defaultDateRange,
      searchQuery: "",
    };

    this.defaultState = {
      courses: null,
      sortBy: {
        field: "Date",
        direction: "desc",
      },
      dateRange: this.defaultDateRange,
      searchQuery: "",
    };
  }


  componentWillMount = () => {
    const url = this.genCourseListUrl(
      this.state.sortBy, "all", this.state.dateRange, 0, this.state.searchQuery);
    this.fetchAndSetCourses(url);
  }


  fetchAndSetCourses = url => {
    authFetch(url).then(response => {
      response.json().then(courses => {
        this.dispatch({
          type: "SET_COURSES",
          data: courses,
        });
      });
    });
  }


  genUtcDateStr = date => {
    const d = date.getUTCDate();
    const m = date.getUTCMonth() + 1; // gotcha
    const y = date.getUTCFullYear();
    return [y, m, d].map(x => x.toString()).join("-");
  }


  genCourseListUrl = (sortBy, cpdType, dateRange, page, searchQuery) => {
    const base = "/course_browse?";
    const sortByParam = "&s=" + sortKey[sortBy.field].toString();
    const sortOrderParam = "&o=" + directionKey[sortBy.direction].toString();
    const startDateParam = "&sd=" + this.genUtcDateStr(dateRange.startDate);
    const endDateParam = "&ed=" + this.genUtcDateStr(dateRange.endDate);
    const searchParam = "&q=" + encodeURIComponent(searchQuery);

    return base + sortByParam + sortOrderParam + startDateParam + endDateParam + searchParam;
  }


  reduce = (prevState, action) => {
    switch (action.type){
      case "SET_COURSES":
        return { courses: action.data };
      case "SET_SORT_BY":
        return { sortBy: action.data };
      case "SET_DATE_RANGE":
        return { dateRange: action.data };
      case "SET_SEARCH_QUERY":
        return { searchQuery: action.data };
    default:
        return prevState;
    }
  }


  dispatch = (action, callback) => {
    this.setState(prevState => this.reduce(prevState, action), () => {
      if (callback){
        callback();
      }
    });
  }


  handleSort = sortBy => {
    this.dispatch({
      type: "SET_SORT_BY",
      data: sortBy,
    }, () => {
      const url = this.genCourseListUrl(
        sortBy, "all", this.state.dateRange, 0, this.state.searchQuery);
      this.fetchAndSetCourses(url);
    });

  }


  handleDateFilter = dateRange => {
    this.dispatch({
      type: "SET_DATE_RANGE",
      data: dateRange,
    }, () => {
      const url = this.genCourseListUrl(
        this.state.sortBy, "all", dateRange, 0, this.state.searchQuery);
      this.fetchAndSetCourses(url);
    });
  }


  handleClearAll = () => {
    this.setState(this.defaultState, () => {
      const url = this.genCourseListUrl(
        this.state.sortBy, "all", this.state.dateRange, 0, this.state.searchQuery);
      this.fetchAndSetCourses(url);
    });
  }


  handleDateFilterClear = () => {
    this.handleDateFilter(this.defaultDateRange);
  }


  handleSearch = searchQuery => {
    this.dispatch({
      type: "SET_SEARCH_QUERY",
      data: searchQuery,
    }, () => {
      const url = this.genCourseListUrl(
        this.state.sortBy, "all", this.state.dateRange, 0, searchQuery);
      this.fetchAndSetCourses(url);
    });
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
            <div>
              <CourseList 
                handleClearAll={this.handleClearAll}
                courses={this.state.courses}>
                <CourseListOpts 
                  handleSort={this.handleSort}
                  handleDateFilter={this.handleDateFilter}
                  handleDateFilterClear={this.handleDateFilterClear}
                />
              </CourseList>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

