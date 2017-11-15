import { h, Component } from "preact";
import { authPost } from "../../../lib/js/fetch";
import format from "date-fns/format";
import parse from "date-fns/parse";
import isValid from "date-fns/is_valid";

export { CourseEditor };

class CourseEditor extends Component{
  constructor(props){
    super(props);

    let course = this.props.course;

    // Unpublished courses only provide the start_date attribute
    if (Object.keys(course).indexOf("start_date") > -1){
      course.start_dates = [course.start_date];
    }

    course.start_dates = course.start_dates.map(
      date => format(date, "DD/MM/YYYY")
    );

    this.state = {
      showDeleteButton: true,
      showDeleteOngoing: false,
      showDeleteConfirm: false,
      showDeleteError: false,
      course: course,
    }
  }


  componentWillReceiveProps = newProps => {
    if (this.state.course !== newProps.course){
      this.setState({ 
        course: newProps.course,
        showDeleteButton: true,
        showDeleteOngoing: false,
        showDeleteConfirm: false,
        showDeleteError: false,
      });
    }
  }


  handleCostChange = value => { 
    let course = this.state.course;
    course.cost = value;
    course.hasChanged = true;
    this.setState({ course });
  }

  
  handleCpdChange = (points, isPrivate) => { 
    if (typeof points === "undefined"){
      points = null;
    }

    let course = this.state.course;
    course.cpd = { isPrivate, points };
    course.hasChanged = true;
    this.setState({ course });
  }


  handleFormatChange = format => { 
    let course = this.state.course;
    course.format = format;
    course.hasChanged = true;
    this.setState({ course });
  }


  handleLevelChange = level => {
    let course = this.state.course;
    course.level = level;
    course.hasChanged = true;
    this.setState({ course });
  }


  handleUrlChange = url => {
    let course = this.state.course;
    course.url = url;
    course.hasChanged = true;
    this.setState({ course });
  }


  handleNameChange = name => {
    let course = this.state.course;
    course.name = name;
    course.hasChanged = true;
    this.setState({ course });
  }
  

  handleDatesChange = dates => {
    let course = this.state.course;
    course.start_dates = dates;
    if (dates[dates.length-1] !== ""){
      course.hasChanged = true;
    }
    this.setState({ course });
  }


	saveCourseData = course => {
		let data = {
			id: course.id, 
			url: course.url,
			name: course.name, 
			cost: course.cost, 
			cpdPoints: course.cpd.points, 
			cpdIsPrivate: course.cpd.isPrivate, 
			level: course.level, 
			format: course.format, 
			start_dates: course.start_dates,
			is_published: !this.props.unpublished,
		};

		authPost("/cms/save_course/", data).then(response => {
			if (response.ok){
        let course = this.state.course;
        course.hasChanged = false;
        this.setState({
          course: course,
          hasSaved: true,
        });
			}
      else{
        //TODO: show error
        console.log("not ok");
      }
    });
  }


  handleSaveClick = () => {
    const course = this.state.course;
    // TODO: input validation
    
    let valid = true;
    if (
      !course.id || 
      !course.cpd || 
      !course.name || 
      !course.cost ||
      !course.level ||
      !course.format ||
      !course.start_dates
    ){
      valid = false;
    }

    if (valid){
      const id = course.id;
      const name = course.name;
      const cost = course.cost;
      const cpdPoints = course.cpd.points;
      const cpdIsPrivate = course.cpd.isPrivate;
      const level = course.level;
      const format = course.format;

      let dates = [];
      course.start_dates.forEach(d => {
        const dateRe = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        if (dateRe.test(d)){
          const sp = d.split("/");
          const day = sp[0];
          const month = sp[1];
          const year = sp[2];

          if (isValid(parse(month + "/" + day + "/" + year))){
            dates.push(d);
          }
        }
      });

      this.saveCourseData(course);
    }
    else{
      console.log("invalid");
    }
    
  }


  handleDeleteClick = () => {
    this.setState({
      showDeleteConfirm: true,
      showDeleteError: false,
    });
  }


  handleDeleteEntry = () => {
    const payload = {
      id: this.props.course.id,
    };

    this.setState({
      showDeleteOngoing: true,
      showDeleteConfirm: false,
      showDeleteButton: false,
      showDeleteError: false,
    }, () => {
      authPost("/cms/delete_course/", payload).then(response => {
        if (response.ok){
          this.props.handleDelete();
          this.setState({
            showDeleteConfirm: false,
            showDeleteOngoing: false,
            showDeleteError: false,
          });
        }
        else{
          this.setState({
            showDeleteConfirm: false,
            showDeleteOngoing: false,
            showDeleteButton: true,
            showDeleteError: true,
          });
        }
      });
    });
  }


  render(){
    const course = this.state.course;

    const nameInput =
      <div class="name pure-u-1">
        <NameInput
          disabled={this.state.hasSaved}
          handleValueChange={this.handleNameChange}
          value={course.name} />
      </div>

    const urlInput =
      <div class="pure-u-1">
        <UrlInput
          disabled={this.state.hasSaved}
          handleValueChange={this.handleUrlChange}
          value={course.url} />
      </div>

    const costInput =
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <CostInput 
          disabled={this.state.hasSaved}
          handleValueChange={this.handleCostChange}
          value={course.cost} />
      </div>

    const cpdInput =
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <CpdInput 
          disabled={this.state.hasSaved}
          handleValueChange={this.handleCpdChange}
          value={course.cpd} />
      </div>

    const levelDropdown = 
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <LevelDropdown 
          disabled={this.state.hasSaved}
          handleValueChange={this.handleLevelChange}
          value={course.level} levels={this.props.levels} />
      </div>

    const formatDropdown = 
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <FormatDropdown 
          disabled={this.state.hasSaved}
          handleValueChange={this.handleFormatChange}
          value={course.format} formats={this.props.formats} />
      </div>

    const saveOrPublish = this.props.unpublished ? "Publish" : "Save";


    const actions = 
      <div class="actions">
        <div class="buttons pure-u-1">
          {this.state.showDeleteOngoing && <span>Deleting...</span> }

          {this.state.showDeleteConfirm ?
            <div class="delete_confirm">
              <label>Delete this entry?</label>
              <button 
                onClick={this.handleDeleteEntry}
                class="pure-button button-red delete_button">
                Yes
              </button>
              <button 
                onClick={() => {this.setState({showDeleteConfirm: false})}}
                class="pure-button">
                No
              </button>
            </div>
            :
            (this.state.showDeleteButton && !this.state.hasSaved) && 
              <button 
                onClick={this.handleDeleteClick}
                class="pure-button button-red delete_button" 
                title="Delete">
                <img src="/static/cms/images/trash.png" alt="delete" /> Delete
              </button>
          }

          {this.state.course.hasChanged &&
            <button 
              onClick={this.handleSaveClick}
              class="pure-button button-green save_button" 
              title="Save">
              <img src="/static/cms/images/tick.png" alt="save" /> {saveOrPublish}
            </button>
          }

          {this.state.showDeleteError &&
            <label class="error_msg">Error: could not delete course.</label>
          }

          {this.state.hasSaved &&
            <div>
              <label class="success_msg">Course published. To edit it, go 
                to <a href="/cms/courses/published">Published Courses</a>.</label>
            </div>
          }
        </div>
      </div>

    // For unpublished courses:
    if (this.props.unpublished){
      let dates = course.start_date == null ? 
        [] 
        : 
        [course.start_date];

      if (course.start_dates){
        dates = course.start_dates;
      }

      const className = "editor " + (this.props.index % 2 === 0 ? "grey_bg" : "");

      return (
        <div class={className}>
          {nameInput}
          {urlInput}
          {costInput}
          {cpdInput}
          <br />
          {levelDropdown}
          {formatDropdown}

          <div class="pure-u-1">
            <DatesInput 
              disabled={this.state.hasSaved}
              handleValueChange={this.handleDatesChange}
              values={dates} />
          </div>

          {actions}
        </div>
      )
    }

    // For published courses:
    return(
      <div class="editor">
        {nameInput}
        {urlInput}
        {costInput}
        {cpdInput}
        <br />
        {levelDropdown}
        {formatDropdown}
        <br />

        <div class="pure-u-1">
          <DatesInput 
            disabled={this.props.disabled}
            handleValueChange={this.handleDatesChange}
            values={course.start_dates} />
        </div>

        {actions}
      </div>
    );
  }
}


class TextInput extends Component{
  constructor(props){
    super(props);

    const value = this.props.value == null ? "" : this.props.value;
    this.state = {
      value
    };
  }


  componentWillReceiveProps(newProps){
    if (this.state.value !== newProps.value){
      this.state = {
        value: newProps.value,
      }
    }
  }


  handleValueChange = value => {
    if (this.state.value !== value){
      this.setState({ value }, () => {
        this.props.handleValueChange(value);
      });
    }
  }
}


class NameInput extends TextInput{
  render(){
    return(
      <div class="custom_input url_input">
        <input type="text" 
          disabled={this.props.disabled}
          placeholder="Name" 
          onKeyUp={e => this.handleValueChange(e.target.value)}
          value={this.state.value} />
      </div>
    );
  }
}


class UrlInput extends TextInput{
  render(){
    return(
      <div class="custom_input url_input">
        <label>URL:</label>
        <input type="text" 
          disabled={this.props.disabled}
          onKeyUp={e => this.handleValueChange(e.target.value)}
          placeholder="(none)"
          value={this.state.value} />
      </div>
    );
  }
}


class CostInput extends TextInput{
  render(){
    return(
      <div class="custom_input">
        <label>Cost ($):</label>
        <input 
          disabled={this.props.disabled}
          type="number" 
          min="0"
          step="0.01"
          onKeyUp={e => {this.handleValueChange(e.target.value)}}
          onChange={e => {this.handleValueChange(e.target.value)}}
          value={this.state.value} />
      </div>
    );
  }
}


class CpdInput extends Component{
  constructor(props){
    super(props);

    if (!this.props.value){
      this.state = {
        blank: true,
      };
    }
    else{
      this.state = {
        blank: false,
        points: this.props.value.points,
        isPrivate: this.props.value.is_private,
      };
    }
  }


  componentWillReceiveProps = newProps => {
    if (newProps.value){
      if (this.state.points !== newProps.value.points ||
        this.state.isPrivate !== newProps.value.isPrivate){
        this.setState({
          blank: false,
          points: newProps.value.points,
          isPrivate: newProps.value.isPrivate,
        });
      }
    }
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
        this.props.handleValueChange(points, false);
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
                disabled={this.props.disabled}
                type="number" placeholder={this.state.isPrivate ? "Private" : "(points)"} 
                min="0"
                onKeyUp={e => {this.handlePointsChange(e.target.value)}}
                onChange={e => {this.handlePointsChange(e.target.value)}}
                onClick={e => {this.handlePointsChange(e.target.value)}}
                value={this.state.isPrivate ? "Private" : this.state.points} />
          }
        </div>

        <div class="pure-u-1-2">
          <label>Private?</label>
          <input class="cpd_is_private_input"
            disabled={this.props.disabled}
            type="checkbox" 
            ref={x => {this.isPrivateInput = x}}
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
          disabled={this.props.disabled}
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
          disabled={this.props.disabled}
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
  constructor(props){
    super(props);
    this.state = {
      values: this.props.values,
    };
  }


  componentWillReceiveProps = newProps => {
    if (this.state.values !== newProps.values){
      this.setState({
        values: newProps.values,
      });
    }
  }


  handleValueChange = values => {
    this.setState({ values }, () => {
      this.props.handleValueChange(values);
    });
  }


  render(){
    return(
      <div class="dates_input">
        <label>Dates (SGT):</label>
        <DateListInput
          disabled={this.props.disabled}
          handleValueChange={this.handleValueChange}
          values={this.state.values}
        />
      </div>
    );
  }
}


class DateListInput extends Component{
  constructor(props){
    super(props);
    this.state = {
      items: this.props.values,
    };
  }


  componentWillReceiveProps(newProps){
    if (this.state.items !== newProps.values){
      this.state = {
        items: newProps.values,
      }
    }
  }


  addItem = e => {
    const items = this.state.items.concat("");
    this.setState({ 
      items
    }, () => {
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
          {!this.props.disabled &&
              <button 
                disabled={this.props.disabled}
                title="Add date"
                onClick={this.addItem}
                class="add_button pure-button pure-button-primary">
                +
              </button>
          }
        </div>
        <div class="list_input_col">
          {this.state.items.length === 0 && 
              <p class="empty">(no entries)</p>}

          {this.state.items.map((item, index) => 
            <DateListInputItem 
              disabled={this.props.disabled}
              handleValueChange={value => this.updateItem(index, value)}
              handleRemoveItem={() => this.removeItem(index)}
              placeholder="dd/mm/yyyy"
              value={item} 
            />
          )}
        </div>
      </div>
    );
  }
}


class DateListInputItem extends Component{
  constructor(props){
    super(props);
    this.state = {
      value: this.props.value,
    };
  }


  componentWillReceiveProps = newProps => {
    if (newProps.value !== this.state.value){
      this.setState({
        value: newProps.value,
      });
    }
  }


  handleValueChange = value => {
    this.props.handleValueChange(value);
  }


  render(){
    return(
      <div class="list_input_item">
        <input
          disabled={this.props.disabled}
          onKeyUp={e => this.handleValueChange(e.target.value)}
          type="text" 
          maxlength="10" placeholder={this.props.placeholder} 
          value={this.state.value} />
        {!this.props.disabled &&
          <span
            onClick={this.props.handleRemoveItem}
            title="Remove date" class="remove_btn">✕</span>
        }
      </div>
    );
  }
}
