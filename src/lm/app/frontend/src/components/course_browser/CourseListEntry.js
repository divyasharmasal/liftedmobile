import { h, Component } from "preact";
import format from "date-fns/format";

export class CourseListEntry extends Component{
  constructor(props){
    super(props);
    this.state = {
      showDetails: false,
    };
  }


  toggleExpand = () => {
    this.setState({
      showDetails: !this.state.showDetails,
    });
  }


  renderCpd = (cpd, bold) => {
    let pointLabel = "points";
    if (!cpd.is_private && cpd.points === 1){
      pointLabel = "point";
    }

    const points = bold ? <em>{cpd.points}</em> : <span>{cpd.points}</span>;

    if (cpd.is_private){
      return <span>Private</span>
    }
    else if (cpd.is_tbc){
      return <span>Public CPD points: <em>TBC</em></span>
    }
    else if (cpd.is_na){
      return <span>CPD points: <em>N/A</em></span>
    }
    else{
      return <span>{points} Public CPD {pointLabel}</span>
    }
  }

    
  renderDateRange = course => {
    if (course.is_ongoing){
      return "Ongoing";
    }
    else{
      return this.formatDateRange(course.date_range);
    }
  }


  formatDateRange = dateRange => {
    const start = dateRange.start;
    const end = dateRange.end;

    if (start == null){
      return "Unknown date";
    }

    const fmtStr = "ddd, D MMM YYYY";

    
    if (end != null){
      const fmtStart = format(start, fmtStr);
      const fmtEnd = format(end, fmtStr);
      
      if (fmtStart === fmtEnd){
        return fmtStart;
      }

      return format(start, fmtStr) + " to " + format(end, fmtStr);
    }
    else{
      return format(start, fmtStr);
    }
  }


  renderCourseName = course => {
    return (
      <a target="_blank" href={course.url}>{course.name}</a>
    );
  }


  renderMobile = (course, showDetails) => {
    const toggleClass = showDetails ? "show" : "hide";

    return(
      <div class="course mobile pure-u-1">
        <div class="title pure-u-1">
          {this.renderCourseName(course)}
        </div>

        <div class="pure-u-22-24">
          <div class="date pure-u-1">
            {this.renderDateRange(course)}
          </div>

          {course.provider &&
            <div class="date pure-u-1">
                  <span>Provider: {course.provider}</span>
            </div>
          }

          <div class="cost pure-u-md-1-3">
            {this.renderCost(course.cost)}
          </div>

          <div class="cpd pure-u-md-1-3">
            {this.renderCpd(course.cpd, false)}
          </div>

          <div class="details">
            <div class={toggleClass}>
              <div class="level pure-u-md-1-3">
                Level: {course.level}
              </div>
              <div class="format pure-u-md-1-3">
                Format: {course.format}
              </div>
            </div>
          </div>
        </div>

        {this.renderToggleArrow("toggle pure-u-1-24 " + toggleClass, this.toggleExpand)}

      </div>
    );
  }

  renderCost = courseCost => {
    if (courseCost.isVarying){
        return "Cost varies";
    }
    else{
      const cost = courseCost.cost;
      if (cost === 0){
        return "Free";
      }
      const dollar = "S$";
      if (!cost % 0.1 > 0){
        return dollar + cost.toString();
      }
      else{
        return dollar + cost.toFixed(2).toString();
      }
    }
  }

  renderDesktop = (course, showDetails) => {
    const toggleClass = showDetails ? "show" : "hide";

    return(
      <div class="course desktop">
        <div class="nums pure-u-5-24">
          <div class="cost pure-u-1">
            <em>{this.renderCost(course.cost)}</em>
          </div>
          <div class="cpd pure-u-1">
            {this.renderCpd(course.cpd, true)}
          </div>
        </div>

        <div class="details pure-u-18-24">
          <div class="title">
            {this.renderCourseName(course)}
          </div>

          <div class="date pure-u-1-2">
            {this.renderDateRange(course)}
          </div>

          <div class="date pure-u-1-2">
            {course.provider &&
                <span>Provider: {course.provider}</span>
            }
          </div>

          <div class={"pure-u-1 " + toggleClass}>
            <div class="pure-u-1-2">
              Level: {course.level}
            </div>
            <div class="pure-u-1-2">
              Format: {course.format}
            </div>
          </div>
        </div>

        {this.renderToggleArrow("toggle pure-u-1-24 " + toggleClass, this.toggleExpand)}

      </div>
    );
  }


  renderToggleArrow = (className, handleOnClick) => {
    return(
      <div class={className} onClick={handleOnClick} >
        <img src="/static/app/dist/images/courses/expand.png" />
      </div>
    );
  }


  render() {
    const course = this.props.course;
    return (
      <div class="course_row">
        {this.renderDesktop(this.props.course, this.state.showDetails)}
        {this.renderMobile(this.props.course, this.state.showDetails)}
      </div>
    );
  }
}

