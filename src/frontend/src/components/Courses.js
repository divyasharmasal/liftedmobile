import { h, Component } from 'preact';
import {renderLoader} from './screens/Screen';

export { Courses };

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
    };
  }


  render(){
    const nameSym = symbol(this.state.nameDesc);
    const dateSym = symbol(this.state.dateDesc);
    const cpdSym = symbol(this.state.cpdDesc);

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
            this.setState({ cpdDesc: !this.state.cpdDesc });
            this.props.handleSort("cpd")}
          }>
            CPD points <span class="symbol">{cpdSym}</span></a>

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
    else{
      return cpd.points.toFixed(0) + " points";
    }
  }


  format_cost = cost => {
    if (cost % 1.0 > 0){
      return "$" + cost.toFixed(0);
    }
    else{
      return "$" + cost.toFixed(2);
    }
  }


  format_dates = dates => {
    return dates.join(", ") + " 2017";
  }


  handleSort = field => {
    let courses = this.state.courses;
    let sortDesc = this.state.sortDesc;

    if (field === "name"){
      courses.courses.sort((a, b) => {
        let x = a[field].toLowerCase();
        let y = b[field].toLowerCase();
        if (x > y){
          return 1;
        }
        return 0;
      });
    }
    else if (field === "cpd"){
      courses.courses.sort((a, b) => {
        let x = a.cpd.points;
        let y = b.cpd.points;

        if (a.cpd.is_private){
          x = -1;
        }
        if (b.cpd.is_private){
          y = -1;
        }
        if (x < y){
          return 1;
        }
        return 0;
      });
    }
    else if (field === "date"){
      const parseDate = date => {
        if (date === "Q1"){
          return new Date("1 Jan");
        }
        else if (date === "Q2"){
          return new Date("1 Apr");
        }
        else if (date === "Q3"){
          return new Date("1 Jul");
        }
        else if (date === "Q4"){
          return new Date("1 Oct");
        }
        else{
          return new Date(date);
        }
      };

      courses.courses.sort((a, b) => {
        let x = parseDate(a.start_dates[0]);
        let y = parseDate(b.start_dates[0]);

        if (x < y){
          return 1;
        }
        return 0;
      });
    }

    if (!sortDesc){
      courses.courses.reverse();
    }
    sortDesc = !sortDesc;

    this.setState({ courses, sortDesc, });
  }


  render(){
    let courses = this.state.courses;
    if (!courses){
      return renderLoader();
    }
    else if (courses.courses.length === 0){
      return (
        <div class="pure-u-1">
          <p>No courses found.</p>
        </div>
      );
    }
    else{
      let rows = [];

      courses.courses.forEach((course, i) => {
        rows.push(
          <tr key={i}>
            <td data-title="Name">
              {course.name}
            </td>
            <td data-title="Cost">{this.format_cost(course.cost)}</td>
            <td data-title="CPD">{this.format_cpd(course.cpd)}</td>
            <td data-title="Level">{course.level}</td>
            <td data-title="Format">{course.format}</td>
            <td data-title="Dates">{this.format_dates(course.start_dates)}</td>
          </tr>
        );
      });

      let isTailored;
      if (!courses.tailored){
        isTailored = [
          <p>We didn't find any courses that matched every option you've 
            selected.</p>,
          <p>Not to worry, you may like the following courses.</p>
        ];
      }

      const nameSym = symbol(this.state.nameDesc);
      const nameSorter = (
        <td class="sorter">
          <a onClick={() => { 
            this.setState({ nameDesc: !this.state.nameDesc });
            this.handleSort("name")} 
          }>
            Name
            <span class="symbol">{nameSym}</span>
          </a> 
        </td>
      );

      const cpdSym = symbol(this.state.cpdDesc);
      const cpdSorter = (
        <td class="sorter">
          <a onClick={() => { 
            this.setState({ cpdDesc: !this.state.cpdDesc });
            this.handleSort("cpd")} 
          }>
            CPD
            <span class="symbol">{cpdSym}</span>
          </a> 
        </td>
      );

      const dateSym = symbol(this.state.dateDesc);
      const dateSorter = (
        <td class="sorter">
          <a onClick={() => { 
            this.setState({ dateDesc: !this.state.dateDesc });
            this.handleSort("date")} 
          }>
            Dates (2017)
            <span class="symbol">{dateSym}</span>
          </a> 
        </td>
      );

      return (
        <div>
          {isTailored}

          {/*
            <p class="for_better_results">
              <a class="scroll_link" 
                href="#top" onClick={this.props.unPadCourses}>
                For better results, answer more questions &#10548;</a>
            </p>,
          */}
          <Sorter 
            handleSort={this.handleSort} />

          <table class="pure-table course_table"
            ref={this.props.courseTableRef}>
            <thead>
              {nameSorter}
              <td>Cost</td>
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
