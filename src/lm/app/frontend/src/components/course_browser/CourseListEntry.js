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

    return(
      <span>
        { cpd.is_private ?
            <span>Private CPD</span>
          :
            <span>{points} CPD {pointLabel}</span>
        }
      </span>
    );
  }


  formatDate = date => {
    return format(date, "dddd, Do MMM YYYY");
  }


  renderCourseName = course => {
    return (
      <a href={course.url}>{course.name}</a>
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
            {this.formatDate(course.start_date)}
          </div>

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

  renderCost = cost => {
    const dollar = "S$";
    if (!cost % 0.1 > 0){
      return dollar + cost.toString();
    }
    else{
      return dollar + cost.toFixed(2).toString();
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

          <div class="date">
            {this.formatDate(course.start_date)}
          </div>

          <div class={"pure-u-1 " + toggleClass}>
            <div class="pure-u-1-3">
              Level: {course.level}
            </div>
            <div class="pure-u-1-3">
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

