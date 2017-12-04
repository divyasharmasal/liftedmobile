import { h, Component } from 'preact';
import {renderLoader} from './screens/Screen';

export { Courses };
import { sortCoursesByDate } from "../../../../../lib/js/courses";
import format from 'date-fns/format';

const symbol = isDesc => {
  const desc = "▼";
  const asc = "▲";

  if (isDesc){ 
    return desc;
  }
  return asc;
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
    if (cpd.points == null){
      return "";
    }
    else if (cpd.is_private){
      return "Private";
    }
    else {
      return cpd.points.toFixed(0) + " points";
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


  format_dates = dates => {
    return dates
      .map(d => format(new Date(d), "D MMM 'YY"))
      .join(", ")
  }


  handleSort = field => {
    let courses = this.state.courses;
    let sortDesc = this.state.sortDesc;

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
        if (parseInt(a.cost) > parseInt(b.cost)){
          return 1;
        }
        return 0;
      });
    }
    else if (field === "cpd"){
      courses.sort((a, b) => {
        let x = a.cpd.points;
        let y = b.cpd.points;

        if (a.cpd.is_private){
          x = -1;
        }
        if (b.cpd.is_private){
          y = -1;
        }
        if (x > y){
          return 1;
        }
        return 0;
      });
    }
    else if (field === "date"){
      courses = sortCoursesByDate(courses);
    }

    if (!sortDesc){
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
            <td data-title="Dates">{this.format_dates(course.start_dates)}</td>
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
          <a>Dates <span class="symbol">{dateSym}</span>
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
