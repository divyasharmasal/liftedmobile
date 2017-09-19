import { h, Component } from "preact";
import { authFetch } from "../../lib/fetch";
import { sortCoursesByDate } from "../../../../lib/js/courses";
import { renderLoader } from "../../../../lib/js/loader_anim";

export class CoursesPage extends Component {
  componentWillMount = () => {
    authFetch("/cms/get_coursespage_data/").then(response => {
      response.json().then(data => {
        // sort by date
        data.courses = sortCoursesByDate(data.courses)
        this.setState({ 
          courses: data.courses,
          levels: data.levels,
          formats: data.formats,
        });
      });
    });
  }


  handleSearchKeyUp = (event) => {
    if (event.key === 'Enter') {
      this.handleSearch(event.target.value);
    }
  }


  handleSearch = text => {
    text = text.trim();
    if (text.length > 0){
    }
  }


  render(){
    if (!this.state.courses){
      return renderLoader();
    }

    return(
      <div class="course_manager">
        <h1>Manage Courses</h1>

        <div class="search pure-form">
          <input 
            ref={search => {this.searchInput = search}}
            onKeyUp={this.handleSearchKeyUp}
            class="search_input" type="text" />
          <button 
            onClick={() => {
              this.handleSearch(this.searchInput.value);
            }}
            class="search_button pure-button pure-button-primary">
            Search
          </button>
        </div>

        <CourseList 
          courses={this.state.courses} 
          levels={this.state.levels}
          formats={this.state.formats}
        />
      </div>
    );
  }
}


export class CourseList extends Component {
  render(){
    return (
      <div>
        {
          this.props.courses.map(course => 
            <CourseEditor 
              course={course} 
              levels={this.props.levels}
              formats={this.props.formats}
            />
          )
        }
      </div>
    );
  }
}


class CourseEditor extends Component{
  handleCostChange = ({ value, isValid}) => {
    this.setState({
      invalid: !isValid,
    });
  }


  render(){
    const course = this.props.course;
    return(
      <div class="editor">
        <div class="name pure-u-1">
          <input type="text" 
            placeholder="Name"
            value={course.name}>
          </input>
        </div>
        <div class="pure-u-1 url_input">
          <label>URL:</label>
          <input type="text" 
            placeholder="(none)"
            value={course.url}>
          </input>
        </div>

        <div class="pure-u-1-2 pure-u-sm-2-5">
          <CostInput 
            handleValueChange={this.handleCostChange}
            value={course.cost} />
        </div>

        <div class="pure-u-1-2 pure-u-sm-2-5">
          <CpdInput value={course.cpd} />
        </div>

        <br />

        <div class="pure-u-1-2 pure-u-sm-2-5">
          <LevelDropdown value={course.level} levels={this.props.levels} />
        </div>

        <div class="pure-u-1-2 pure-u-sm-2-5">
          <FormatDropdown value={course.format} formats={this.props.formats} />
        </div>

        <br />

        <div class="pure-u-1">
          <DatesInput values={course.start_dates} />
        </div>


        <div class="actions">
          <div class="buttons pure-u-1-2 pure-u-sm-2-5">

            <button class="pure-button button-green save_button">
              <img src="/static/cms/dist/images/tick.png" alt="save"/>
            </button>

            <button class="pure-button pure-button-primary edit_button">
              <img src="/static/cms/dist/images/pencil.png" alt="edit"/>
            </button>

            <button class="pure-button button-red delete_button">
              <img src="/static/cms/dist/images/trash.png" alt="delete"/>
            </button>

          </div>

          <div class="pure-u-1-2 pure-u-sm-2-5">
            {this.state.invalid && "Please enter valid information."}
          </div>
        </div>
      </div>
    );
  }
}


class CostInput extends Component{
  constructor(props){
    super(props);
    this.state = {
      value: this.props.value,
      isValid: this.validate(this.props.value)
    };
  }

  decimalPlaces = num => {
    var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) { 
      return 0; 
    }

    return Math.max( 0,
      // Number of digits right of decimal point.
      (match[1] ? match[1].length : 0)
      // Adjust for scientific notation.
      - (match[2] ? +match[2] : 0));
  }

  validate = value => {
    return this.decimalPlaces(value) < 3;
  }


  handleValueChange = value => {
    const isValid = this.validate(value);

    this.setState({ value, isValid });

    this.props.handleValueChange({ value, isValid });
  }


  render(){

    return(
      <div class="custom_input">
        <label>Cost ($):</label>
        <input 
          class={!this.state.isValid && "invalid"}
          type="number" 
          onKeyUp={e => {this.handleValueChange(e.target.value)}}
          placeholder="(missing cost)" 
          value={this.state.value} />
      </div>
    );
  }
}


class CpdInput extends Component{
  constructor(props){
    super(props);
    
    this.state = {
      points: this.props.value.points,
      is_private: this.props.value.is_private,
    };
  }


  handlePrivateInputCheck = e => {
    this.setState({
      is_private: e.target.checked
    });
  }


  render(){
    if (this.state.is_private){
    }
    return(
      <div class="custom_input">
        <div class="pure-u-1-2">
          {/*<label>{this.state.is_private ? "CPD" : "CPD points"}:</label>*/}
          <label>CPD:</label>

          {this.state.is_private ?
            <label class="cpd_points_private">Private</label>
            :
            <input class="cpd_points_input" 
              disabled={this.state.is_private}
              type="number" placeholder={this.state.is_private ? "Private" : "(points)"} 
              value={this.state.is_private ? "Private" : this.state.points} />
          }
        </div>

        <div class="pure-u-1-2">
          <label>Private?</label>
          <input class="cpd_is_private_input"
            type="checkbox" 
            onChange={this.handlePrivateInputCheck}
            checked={this.state.is_private} />
        </div>
      </div>
    );
  }
}


class LevelDropdown extends Component{
  render(){
    return (
      <div class="custom_input">
        <label>Level:</label>
        <select
          selectedIndex={this.props.levels.indexOf(this.props.value)}
        >
          {this.props.levels.map(level => 
            <option>{level}</option>
          )}
        </select>
      </div>
    );
  }
}


class FormatDropdown extends Component{
  render(){
    return (
      <div class="custom_input">
        <label>Format:</label>
        <select
          selectedIndex={this.props.formats.indexOf(this.props.value)}
        >
          {this.props.formats.map(format => 
            <option>{format}</option>
          )}
        </select>
      </div>
    );
  }
}


class DatesInput extends Component{
  render(){
    return(
      <div class="custom_input">
        <label>Dates:</label>
        <div class="dates_picker">
          {this.props.values.join(", ")}
        </div>
      </div>
    );
  }
}
