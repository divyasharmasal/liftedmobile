import { h, Component } from 'preact';
import format from 'date-fns/format';

import {renderLoader} from './screens/Screen';
import { sortCoursesByDateRange } from "../../../../../lib/js/courses";

export { Courses };

const symbol = isDesc => {
  const desc = "▼";
  const asc = "▲";

  return isDesc ? desc : asc;
  //if (isDesc){ 
    //return desc;
  //}
  //return asc;
}


class Sorter extends Component{
  constructor(props){
    super(props);
    this.state = {
      nameDesc: true,
      cpdDesc: true,
      dateDesc: true,
      costDesc: true,
    };
  }


  render(){
    const nameSym = symbol(this.state.nameDesc);
    const costSym = symbol(this.state.costDesc);
    const cpdSym = symbol(this.state.cpdDesc);
    const dateSym = symbol(this.state.dateDesc);

    return (
      <div class="sorter mobile_only">
        <p>
          Sort: 
          <a onClick={() => {
            this.setState({ nameDesc: !this.state.nameDesc });
            this.props.handleSort("name")}
          }>
            Name <span class="symbol">{nameSym}</span></a> 

          <a onClick={() => {
            this.setState({ costDesc: !this.state.costDesc });
            this.props.handleSort("cost")}
          }>
            Cost <span class="symbol">{costSym}</span></a> 

          <a onClick={() => {
            this.setState({ cpdDesc: !this.state.cpdDesc });
            this.props.handleSort("cpd")}
          }>
            CPD <span class="symbol">{cpdSym}</span></a>

          <a onClick={() => {
            this.setState({ dateDesc: !this.state.dateDesc });
            this.props.handleSort("date")}
          }>
            Date <span class="symbol">{dateSym}</span></a> 

        </p>
      </div>
    );
  }
}


export default class Courses extends Component{
  constructor(props){
    super(props);
    this.firstSort = false;
    this.state = {
      courses: this.props.courses,
      sortDesc: true,
      nameDesc: true,
      cpdDesc: true,
      dateDesc: true,
      costDesc: true,
    };
  }


  componentWillReceiveProps(nextProps){
    if (nextProps.courses !== this.props.courses){
      this.setState({
        courses: nextProps.courses,
      });

      if (!this.firstSort){
        this.firstSort = true;
        this.handleSort("date");
      }
    }
  }


  format_cpd = cpd => {
    if (cpd.is_private){
      return "Private";
    }
    else if (cpd.is_tbc){
      return "Public points: TBC";
    }
    else if (cpd.is_na){
      return "N/A";
    }
    else if (cpd.points == null){
      return "";
    }
    else if (cpd.points === 0){
      return "Nil";
    }
    else {
      if (cpd.points * 10 % 10 > 0){
        return cpd.points.toFixed(1) + " points";
      }
      else{
        return cpd.points.toFixed(0) + " points";
      }
    }
  }


  format_cost = cost => {
    if (cost.isVarying){
      return "Cost varies";
    }
    else{
      return "$" + cost.cost.toFixed(2);
    }
  }


  format_date_range = course => {
    //TODO: move to lib/

    if (course.is_ongoing){
      return "Ongoing";
    }

    const start = course.date_range.start;
    const end = course.date_range.end;

    if (start == null){
      return "Invalid date";
    }

    const fmtStr = "ddd, D MMM YYYY";

    if (end != null){
      const fmtStart = format(start, fmtStr);
      const fmtEnd = format(end, fmtStr);

      if (fmtStart === fmtEnd){
        return fmtStart;
      }
      else{
        return fmtStart + " to " + fmtEnd;
      }
    }
    else{
      return format(start, fmtStr);
    }
  }


  handleSort = field => {
    let courses = this.state.courses;
    let sortDesc = this.state.sortDesc;
    let shouldReverse = true;

    if (field === "name"){
      courses.sort((a, b) => {
        let x = a[field].toLowerCase();
        let y = b[field].toLowerCase();
        if (x > y){
          return 1;
        }
        return 0;
      });
    }
    else if (field === "cost"){
      courses.sort((a, b) => {
        const aVaries = a.cost.isVarying;
        const aCost = a.cost.cost;

        const bVaries = b.cost.isVarying;
        const bCost = b.cost.cost;

        if (aVaries && bVaries){
          return 0;
        }
        else if (!aVaries || !bVaries){
          if (aCost === 0 && bVaries){
            return -1;
          }
          else if (bCost === 0 && aVaries){
            return 1;
          }
          else if (aCost > 0 && bVaries){
            return 1;
          }
          else if (bCost > 0 && aVaries){
            return -1;
          }
        }
        return aCost - bCost;
      });
    }
    else if (field === "cpd"){
      let privCourses = courses.filter(c => c.cpd.is_private);
      let tbcCourses = courses.filter(c => c.cpd.is_tbc);
      let naCourses = courses.filter(c => c.cpd.is_na);
      let ptsCourses = courses.filter(c => c.cpd.points != null);

      ptsCourses.sort((a, b) => {
        const aPts = a.cpd.points;
        const bPts = b.cpd.points;
        return aPts - bPts;
      });

    if (!sortDesc && shouldReverse){
        ptsCourses.reverse();
        shouldReverse = false;
      }

      courses = ptsCourses.concat(tbcCourses).concat(privCourses).concat(naCourses);
    }
    else if (field === "date"){
      courses = sortCoursesByDateRange(courses);
    }

    if (!sortDesc && shouldReverse){
      courses.reverse();
    }
    sortDesc = !sortDesc;

    this.setState({ courses, sortDesc, });
  }


  render(){
    let courses = this.state.courses;
    if (!courses){
      return renderLoader();
    }
    else if (courses.length === 0){
      return (
        <div class="pure-u-1">
          <p>No courses found.</p>
        </div>
      );
    }
    else{
      let rows = [];

      courses.forEach((course, i) => {
        rows.push(
          <tr key={i}>
            <td data-title="Name">
              {course.url ?
                <a href={course.url} target="_blank">{course.name}</a>
                :
                course.name
              }
            </td>
            <td data-title="Cost">{this.format_cost(course.cost)}</td>
            <td data-title="CPD">{this.format_cpd(course.cpd)}</td>
            <td data-title="Level" class="full_width">{course.level}</td>
            <td data-title="Format" class="full_width">{course.format}</td>
            <td data-title="Date">{this.format_date_range(course)}</td>
          </tr>
        );
      });

      const nameSym = symbol(this.state.nameDesc);
      const nameSorter = (
        <td onClick={() => { 
              this.setState({ nameDesc: !this.state.nameDesc });
              this.handleSort("name")} 
            }
          class="sorter">
          <a>Name
            <span class="symbol">{nameSym}</span>
          </a> 
        </td>
      );

      const cpdSym = symbol(this.state.cpdDesc);
      const cpdSorter = (
        <td onClick={() => { 
              this.setState({ cpdDesc: !this.state.cpdDesc });
              this.handleSort("cpd")} 
            }
          class="sorter">
          <a>CPD
            <span class="symbol">{cpdSym}</span>
          </a> 
        </td>
      );

      const dateSym = symbol(this.state.dateDesc);
      const dateSorter = (
        <td onClick={() => { 
              this.setState({ dateDesc: !this.state.dateDesc });
              this.handleSort("date")} 
            }
          class="sorter">
          <a>Date <span class="symbol">{dateSym}</span>
          </a> 
        </td>
      );

      const costSym = symbol(this.state.costDesc);
      const costSorter = (
        <td onClick={() => { 
              this.setState({ costDesc: !this.state.costDesc });
              this.handleSort("cost")} 
            }
          class="sorter">
          <a>Cost
            <span class="symbol">{costSym}</span>
          </a> 
        </td>
      );

      return (
        <div class="courses pure-u-1">
          <Sorter handleSort={this.handleSort} />

          <table class="pure-table course_table"
            ref={this.props.courseTableRef}>
            <thead>
              {nameSorter}
              {costSorter}
              {cpdSorter}
              <td>Level</td>
              <td>Format</td>
              {dateSorter}
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
      );
    }
  }
}
