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
      hasChanged: true,
    });
  }


  handleCpdChange = (value, isPrivate) => {
    this.setState({
      hasChanged: true,
    });
  }


  handleFormatChange = format => {
    this.setState({
      hasChanged: true,
    });
  }


  handleLevelChange = level => {
    this.setState({
      hasChanged: true,
    });
  }
  

  handleDatesChange = dates => {
    this.setState({
      hasChanged: true,
    });
  }


  handleUrlChange = url => {
    this.setState({
      hasChanged: true,
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
        <div class="pure-u-1">
          <UrlInput
            handleValueChange={this.handleUrlChange}
            value={course.url} />
        </div>

        <div class="pure-u-1-2 pure-u-sm-2-5">
          <CostInput 
            handleValueChange={this.handleCostChange}
            value={course.cost} />
        </div>

        <div class="pure-u-1-2 pure-u-sm-2-5">
          <CpdInput 
            handleValueChange={this.handleCpdChange}
            value={course.cpd} />
        </div>

        <br />

        <div class="pure-u-1-2 pure-u-sm-2-5">
          <LevelDropdown 
            handleValueChange={this.handleLevelChange}
            value={course.level} levels={this.props.levels} />
        </div>

        <div class="pure-u-1-2 pure-u-sm-2-5">
          <FormatDropdown 
            handleValueChange={this.handleFormatChange}
            value={course.format} formats={this.props.formats} />
        </div>

        <br />

        <div class="pure-u-1">
          <DatesInput 
            handleValueChange={this.handleDatesChange}
            values={course.start_dates} />
        </div>


        <div class="actions">
          <div class="buttons pure-u-1-2 pure-u-sm-2-5">

            <button class="pure-button button-red delete_button" title="Delete event">
              <img src="/static/cms/dist/images/trash.png" alt="delete"/> Delete
            </button>

            {this.state.hasChanged &&
              <button class="pure-button button-green save_button" title="Save">
                <img src="/static/cms/dist/images/tick.png" alt="save"/> Save
              </button>
            }

          </div>

          <div class="pure-u-1-2 pure-u-sm-2-5">
            {this.state.invalid && "Please enter valid information."}
          </div>
        </div>
      </div>
    );
  }
}


class UrlInput extends Component{
  constructor(props){
    super(props);
    this.state = {
      value: this.props.value,
    }
  }


  handleValueChange = value => {
    if (this.state.value !== value){
      this.setState({ value }, () => {
        this.props.handleValueChange(value);
      });
    }
  }


  render(){
    return(
      <div class="custom_input url_input">
        <label>URL:</label>
        <input type="text" 
          onKeyUp={e => this.handleValueChange(e.target.value)}
          placeholder="(none)"
          value={this.state.value} />
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
          onChange={e => {this.handleValueChange(e.target.value)}}
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
      isPrivate: this.props.value.isPrivate,
    };
  }


  handlePrivateInputCheck = e => {
    const isPrivate = e.target.checked;

    this.setState({ isPrivate: isPrivate }, () => {
      this.props.handleValueChange(this.state.points, isPrivate);
    });
  }


  handlePointsChange = points => {
    if (this.state.points !== points){
      this.setState({ points }, () => {
        this.props.handleValueChange(points, this.state.isPrivate);
      });
    }
  }


  render(){
    return(
      <div class="custom_input">
        <div class="pure-u-1-2">
          <label>CPD:</label>

          {this.state.isPrivate ?
              <label class="cpd_points_private">Private</label>
              :
              <input class="cpd_points_input" 
                disabled={this.state.isPrivate}
                type="number" placeholder={this.state.isPrivate ? "Private" : "(points)"} 
                onKeyUp={e => {this.handlePointsChange(e.target.value)}}
                onChange={e => {this.handlePointsChange(e.target.value)}}
                onClick={e => {this.handlePointsChange(e.target.value)}}
                value={this.state.isPrivate ? "Private" : this.state.points} />
          }
        </div>

        <div class="pure-u-1-2">
          <label>Private?</label>
          <input class="cpd_is_private_input"
            type="checkbox" 
            onChange={this.handlePrivateInputCheck}
            checked={this.state.isPrivate} />
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
          onChange={e => this.props.handleValueChange(e.target.value)}
          selectedIndex={this.props.levels.indexOf(this.props.value)} >
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
          onChange={e => this.props.handleValueChange(e.target.value)}
          selectedIndex={this.props.formats.indexOf(this.props.value)} >
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
      <div class="dates_input">
        <label>Dates:</label>
        <ListInput
          handleValueChange={this.props.handleValueChange}
          values={this.props.values}
        />
      </div>
    );
  }
}


class ListInput extends Component{
  constructor(props){
    super(props);
    this.state = {
      items: this.props.values,
    };
  }


  addItem = e => {
    const items = this.state.items.concat("");
    this.setState({ items }, () => {
      this.props.handleValueChange(items);
    });
  }


  removeItem = index => {
    let items = this.state.items;
    items.splice(index, 1);
    this.setState({ items }, () => {
      this.props.handleValueChange(items);
    });
  }


  updateItem = (index, value) => {
    let items = this.state.items;
    items[index] = value;
    this.setState({ items }, () => {
      this.props.handleValueChange(items);
    });
  }


  render(){
    return(
      <div class="list_input">
        <div class="button_col">
          <button 
            title="Add date"
            onClick={this.addItem}
            class="add_button pure-button pure-button-primary">
            +
          </button>
        </div>
        <div class="list_input_col">

          {this.state.items.map((item, index) => 
            <ListInputItem 
              handleValueChange={value => this.updateItem(index, value)}
              handleRemoveItem={() => this.removeItem(index)}
              value={item} 
            />
          )}
        </div>
      </div>
    );
  }
}


class ListInputItem extends Component{
  render(){
    return(
      <div class="list_input_item">
        <input 
          onKeyUp={e => this.props.handleValueChange(e.target.value)}
          type="text" 
          maxlength="10" placeholder="dd/mm/yyyy" value={this.props.value} />
        <span 
          onClick={this.props.handleRemoveItem}
          title="Remove date" class="remove_btn">✕</span>
      </div>
    );
  }
}
