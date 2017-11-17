import { h, Component } from "preact";
import { authPost } from "../../../lib/js/fetch";
import format from "date-fns/format";
import parse from "date-fns/parse";
import isValid from "date-fns/is_valid";
import ScrollableAnchor from 'react-scrollable-anchor';
import { configureAnchors } from 'react-scrollable-anchor';
configureAnchors({
  offset:-20,
  scrollDuration: 0,
  keepLastAnchorHash: true,
})

export { CourseEditor };

class CourseEditor extends Component{
  constructor(props){
    super(props);
    let course = this.props.course;

    if (Object.keys(this.props.course).indexOf("cpd") === -1){
      course.cpd = {
        points: null,
        is_private: null,
      };
    }

    // Rename is_private to isPrivate
    course.cpd.isPrivate = course.cpd.is_private;
    delete course.cpd.is_private;

    // Unpublished courses only provide the start_date attributem, instead of a
    // list of start dates.
    if (Object.keys(course).indexOf("start_date") > -1){
      if (course.start_date == null){
        course.start_dates = [];
      }
      else{
        course.start_dates = [course.start_date];
      }
    }

    course.start_dates = course.start_dates.map(
      date => format(date, "DD/MM/YYYY")
    );

    this.state = {
      course: course,
      showDeleteButton: true,
      showDeleteOngoing: false,
      showDeleteConfirm: false,
      showDeleteError: false,
      invalidInput: false,
      invalidFields: {},
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

    let invalidFields = this.state.invalidFields;
    invalidFields.cost = false;
    this.setState({ course, invalidFields });
  }

  
  handleCpdChange = (points, isPrivate) => { 
    if (typeof points === "undefined"){
      points = null;
    }

    let course = this.state.course;
    course.cpd = { isPrivate, points };
    course.hasChanged = true;

    let invalidFields = this.state.invalidFields;
    invalidFields.cpd = false;
    this.setState({ course, invalidFields });
  }


  handleFormatChange = format => { 
    let course = this.state.course;
    course.format = format;
    course.hasChanged = true;

    let invalidFields = this.state.invalidFields;
    invalidFields.format = false;
    this.setState({ course, invalidFields });
  }


  handleLevelChange = level => {
    let course = this.state.course;
    course.level = level;
    course.hasChanged = true;

    let invalidFields = this.state.invalidFields;
    invalidFields.level = false;
    this.setState({ course, invalidFields });
  }


  handleUrlChange = url => {
    let course = this.state.course;
    course.url = url;
    course.hasChanged = true;

    let invalidFields = this.state.invalidFields;
    invalidFields.url = false;
    this.setState({ course, invalidFields });
  }


  handleNameChange = name => {
    let course = this.state.course;
    course.name = name;
    course.hasChanged = true;

    let invalidFields = this.state.invalidFields;
    invalidFields.name = false;
    this.setState({ course, invalidFields });
  }
  

  handleDatesChange = dates => {
    let course = this.state.course;
    course.start_dates = dates;
    if (dates[dates.length-1] !== ""){
      course.hasChanged = true;
    }

    let invalidFields = this.state.invalidFields;
    invalidFields.startDates = false;
    this.setState({ course, invalidFields });
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
      is_new: course.isNew,
		};

		authPost("/cms/save_course/", data).then(response => {
			if (response.ok){
        response.json().then(json => {
          let course = this.state.course;
          course.hasChanged = false;

          this.setState({
            course: course,
            hasSaved: true,
            showSaveError: false,
            showDeleteButton: true,
            showDeleteOngoing: false,
            showDeleteConfirm: false,
            showDeleteError: false,
            invalidInput: false,
            invalidFields: {},
            publishedCourseId: json.published_course_id,
          });
        });
			}
      else{
        this.setState({
          hasSaved: false,
          showSaveError: true,
          showDeleteError: false,
          showDeleteOngoing: false,
          showDeleteConfirm: false,
          invalidInput: false,
          invalidFields: {}
        });
      }
    });
  }


  handleSaveClick = () => {
    const course = this.state.course;

    let validCpd = false;

    // neither points nor isPrivate can both be null
    if (course.cpd.points != null || course.cpd.isPrivate != null){
      validCpd = true;
    }

    // there must either be CPD points, or isPrivate == true
    if (course.cpd.points == null && course.cpd.isPrivate === false){
      validCpd = false;
    }

    const validName = course.name.trim().length > 0;
    const validUrl = course.url.trim().length > 0;
    const validCost = parseFloat(course.cost, 10) ===
      Math.abs(parseFloat(Math.round(course.cost * 100) / 100));
    const validLevel = this.props.levels.indexOf(course.level) > -1;
    const validFormat = this.props.formats.indexOf(course.format) > -1;

    const isValidDate = d => {
      const dateRe = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (dateRe.test(d)){
        const sp = d.split("/");
        const day = sp[0];
        const month = sp[1];
        const year = sp[2];
        return isValid(parse(month + "/" + day + "/" + year));
      }
      return false;
    };

    const startDates = course.start_dates.filter(d => d.length > 0);
    const validStartDates = 
      startDates.length > 0 && 
      startDates.every(isValidDate);

    let valid = (
      validCpd &&
      validName &&
      validUrl &&
      validCost &&
      validLevel &&
      validFormat &&
      validStartDates);

    if (valid){
      this.saveCourseData(course);
    }
    else{
      this.setState({ 
        invalidInput: true, 
        invalidFields: {
          cpd: !validCpd,
          name: !validName,
          url: !validUrl,
          cost: !validCost,
          level: !validLevel,
          format: !validFormat,
          startDates: !validStartDates
        },
      });
    }
  }


  handleDeleteClick = () => {
    this.setState({
      showDeleteConfirm: true,
      showDeleteError: false,
    });
  }


  handleDeleteEntry = () => {
    if (this.props.course.isNew){
      this.props.handleDelete();
    }
    else{
      const payload = {
        id: this.props.course.id,
        is_published: !this.props.unpublished,
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
              invalidInput: false,
            });
          }
          else{
            this.setState({
              showDeleteConfirm: false,
              showDeleteOngoing: false,
              showDeleteButton: true,
              showDeleteError: true,
              invalidInput: false,
            });
          }
        });
      });
    }
  }


  render(){
    const course = this.state.course;

    const nameInput =
      <div class="name pure-u-1">
        <NameInput
          disabled={this.state.hasSaved && this.props.unpublished}
          handleValueChange={this.handleNameChange}
          invalid={this.state.invalidFields.name}
          value={course.name} />
      </div>

    const urlInput =
      <div class="pure-u-1">
        <UrlInput
          disabled={this.state.hasSaved && this.props.unpublished}
          handleValueChange={this.handleUrlChange}
          invalid={this.state.invalidFields.url}
          value={course.url} />
      </div>

    const costInput =
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <CostInput 
          disabled={this.state.hasSaved && this.props.unpublished}
          handleValueChange={this.handleCostChange}
          invalid={this.state.invalidFields.cost}
          value={course.cost} />
      </div>

    const cpdInput =
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <CpdInput 
          disabled={this.state.hasSaved && this.props.unpublished}
          handleValueChange={this.handleCpdChange}
          invalid={this.state.invalidFields.cpd}
          value={course.cpd} />
      </div>

    const levelDropdown = 
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <LevelDropdown 
          disabled={this.state.hasSaved && this.props.unpublished}
          handleValueChange={this.handleLevelChange}
          invalid={this.state.invalidFields.level}
          value={course.level} levels={this.props.levels} />
      </div>

    const formatDropdown = 
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <FormatDropdown 
          disabled={this.state.hasSaved && this.props.unpublished}
          handleValueChange={this.handleFormatChange}
          invalid={this.state.invalidFields.format}
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
              <button onClick={this.handleDeleteEntry}
                class="pure-button button-red delete_button">
                Yes
              </button>
              <button 
                onClick={() => {
                  this.setState({
                    showDeleteConfirm: false,
                  })}}
                class="pure-button">
                No
              </button>
            </div>
            :
            (this.state.showDeleteButton) && 
              <button onClick={this.handleDeleteClick}
                class="pure-button button-red delete_button" 
                title="Delete">
                <img src="/static/cms/images/trash.png" 
                  alt="delete" /> Delete
              </button>
          }

          {this.state.course.hasChanged &&
            <button onClick={this.handleSaveClick}
              class="pure-button button-green save_button" 
              title="Save">
              <img src="/static/cms/images/tick.png" 
                alt="save" /> {saveOrPublish}
            </button>
          }

          {this.state.showDeleteError &&
            <label class="error_msg">Error: could not delete course.</label>
          }

          {this.state.showSaveError &&
            <label class="error_msg">Error: could not save course.</label>
          }

          {this.state.invalidInput &&
            <label class="error_msg">
              Invalid or incomplete data; please check your input.
            </label>
          }

          {this.state.hasSaved && this.props.unpublished &&
            <label class="success_msg">Course published. To edit it, go 
              to <a href={"/cms/courses/published#" 
                  + this.state.publishedCourseId.toString()}
              >Published Courses</a>.</label>
          }

          {this.state.hasSaved && !this.props.unpublished &&
             !(this.state.course.hasChanged && this.state.hasSaved) && 
             <label class="success_msg">Course saved.</label>
          }
        </div>
      </div>

    let className = "editor " + (this.props.index % 2 === 0 ? "grey_bg" : "");

    // For unpublished courses:
    if (this.props.unpublished){
      let dates = course.start_date == null ? 
        [] 
        : 
        [course.start_date];

      if (course.start_dates){
        dates = course.start_dates;
      }

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
              disabled={this.state.hasSaved && this.props.unpublished}
              handleValueChange={this.handleDatesChange}
              invalid={this.state.invalidFields.startDates}
              values={dates} />
          </div>

          {actions}
        </div>
      )
    }

    // For published courses:
    if (typeof window !== "undefined" && typeof course.id !== "undefined"){
      if (course.id.toString() === window.location.hash.substring(1)){
        className += " hash_highlight";
      }
    }
    return(
      <div class={className}>
        {course.id &&
          <ScrollableAnchor id={course.id.toString()}>
            <span />
          </ScrollableAnchor>
        }
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
            invalid={this.state.invalidFields.startDates}
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
    const invalid = this.props.invalid;
    this.state = { value, invalid };
  }


  componentWillReceiveProps(newProps){
    this.state = {
      value: newProps.value,
      invalid: newProps.invalid,
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


const renderClassname = (isInvalid, className) => {
  return (isInvalid ? "highlight" : "") + " " + className;
}


class NameInput extends TextInput{
  render(){
    return(
      <div class={renderClassname(this.state.invalid, "name_input")}>
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
      <div class={renderClassname(this.state.invalid, "url_input")}>
        <label>URL:</label>
        <textarea
          disabled={this.props.disabled}
          onKeyUp={e => this.handleValueChange(e.target.value)}
          placeholder="(none)"
          rows="2"
          value={this.state.value} />
      </div>
    );
  }
}


class CostInput extends TextInput{
  render(){
    return(
      <div class={renderClassname(this.state.invalid, "custom_input")}>
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
        invalid: this.props.invalid,
      };
    }
    else{
      this.state = {
        blank: false,
        points: this.props.value.points,
        isPrivate: this.props.value.isPrivate,
        invalid: this.props.invalid,
      };
    }
  }


  componentWillReceiveProps = newProps => {
    if (newProps.value){
      if (this.state.points !== newProps.value.points ||
        this.state.isPrivate !== newProps.value.isPrivate ||
        this.state.invalid !== newProps.invalid){
        this.setState({
          blank: false,
          points: newProps.value.points,
          isPrivate: newProps.value.isPrivate,
          invalid: newProps.invalid,
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
    if (points === ""){
      points = null;
    }
    if (this.state.points !== points){
      this.setState({ points }, () => {
        this.props.handleValueChange(points, false);
      });
    }
  }


  render(){
    return(
      <div class={renderClassname(this.state.invalid, "custom_input")}>
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
      <div class={renderClassname(this.props.invalid, "custom_input")}>
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
      <div class={renderClassname(this.props.invalid, "custom_input")}>
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
      invalid: this.props.invalid,
    };
  }


  componentWillReceiveProps = newProps => {
    if (this.state.values !== newProps.values ||
        this.state.invalid !== newProps.invalid){
      this.setState({
        values: newProps.values,
        invalid: newProps.invalid,
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
      <div class={renderClassname(this.state.invalid, "dates_input")}>
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
    this.setState({ value }, () => {
      this.props.handleValueChange(value);
    });
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
