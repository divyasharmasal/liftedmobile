import { h, Component } from "preact";
import { authPost } from "../../../lib/js/fetch";
import format from "date-fns/format";
import parse from "date-fns/parse";
import isValid from "date-fns/is_valid";
import ScrollableAnchor from 'react-scrollable-anchor';
import { configureAnchors } from 'react-scrollable-anchor';
import { LiftedKeyInput } from "./LiftedKeyInput";

configureAnchors({
  offset:-20,
  scrollDuration: 0,
  keepLastAnchorHash: true,
})

export { CourseEditor };


const dateRangeToStr = dateRange => {
  const fmt = "DD/MM/YYYY";
  if (dateRange.end){
    return format(dateRange.start, fmt) + " - " + format(dateRange.end, fmt);
  }
  else{
    return format(dateRange.start, fmt);
  }
}


class CourseEditor extends Component{
  constructor(props){
    super(props);
    let course = this.props.course;

    if (Object.keys(this.props.course).indexOf("cpd") === -1){
      course.cpd = {
        points: null,
        is_private: null,
        is_tbc: null,
      };
    }

    if (course.cpd.is_private == null){
      course.cpd.is_private = false;
    }

    if (course.cpd.is_tbc == null){
      course.cpd.is_tbc = false;
    }

    if (Object.keys(course).indexOf("date_ranges") === -1){
      course.date_ranges = [];
    }
    else{
      course.date_ranges = course.date_ranges.map(dateRangeToStr);
    }

    if (Object.keys(course).indexOf("is_manually_added") === -1){
      course.is_manually_added = false;
    }

    if (Object.keys(course).indexOf("is_ongoing") === -1){
      course.is_ongoing = false;
    }

    this.state = {
      course: course,
      showDeleteButton: true,
      showDeleteOngoing: false,
      showDeleteConfirm: false,
      showDeleteError: false,
      invalidInput: false,
      invalidFields: {},
      unpublished: this.props.unpublished,
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
        unpublished: newProps.unpublished,
      });
    }
  }


  handleCostChange = (cost, isVarying) => { 
    let course = this.state.course;
    if (!cost){
      cost = null;
    }
    course.cost = { cost, isVarying };
    course.hasChanged = true;

    let invalidFields = this.state.invalidFields;
    invalidFields.cost = false;
    this.setState({ course, invalidFields });
  }


  handleProviderChange = value => { 
    let course = this.state.course;
    course.provider = value;
    course.hasChanged = true;

    let invalidFields = this.state.invalidFields;
    invalidFields.provider = false;
    this.setState({ course, invalidFields });
  }

  
  handleCpdChange = (points, is_private, is_tbc, is_na) => { 
    if (typeof points === "undefined"){
      points = null;
    }

    if (!is_tbc){
      is_tbc = false;
    }

    if (!is_na){
      is_na = false;
    }

    let course = this.state.course;
    course.cpd = { is_private, points, is_tbc, is_na };
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
    course.date_ranges = dates;
    if (dates[dates.length-1] !== ""){
      course.hasChanged = true;
    }

    let invalidFields = this.state.invalidFields;
    invalidFields.dateRanges = false;
    this.setState({ course, invalidFields });
  }


  handleOngoingChange = is_ongoing => {
    let course = this.state.course;
    course.date_ranges = [];

    let invalidFields = this.state.invalidFields;

    if (is_ongoing == null){
      is_ongoing = false;
    }

    if (is_ongoing){
      invalidFields.dateRanges = false;
    }

    course.is_ongoing = is_ongoing;
    course.hasChanged = true;

    this.setState({ course, invalidFields });
  }


  handleLiftedKeyChange = liftedKeys => {
    let course = this.state.course;
    course.lifted_keys = liftedKeys;
    course.hasChanged = true;

    let invalidFields = this.state.invalidFields;
    invalidFields.liftedKeys = false;
    this.setState({ course, invalidFields });
  }


	saveCourseData = course => {
		let data = {
			id: course.id, 
			url: course.url,
			name: course.name, 
			cost: course.cost, 
			cpdPoints: course.cpd.points, 
			cpdIsPrivate: course.cpd.is_private, 
			cpdIsTbc: course.cpd.is_tbc, 
			cpdIsNa: course.cpd.is_na, 
			level: course.level, 
			format: course.format, 
      is_ongoing: course.is_ongoing,
			date_ranges: course.date_ranges,
			is_published: !this.state.unpublished,
      is_new: course.isNew,
      spider_name: course.spider_name,
      lifted_keys: course.lifted_keys,
      is_manually_added: course.is_manually_added,
      provider: course.provider,
		};

		authPost("/cms/save_course/", data).then(response => {
			if (response.ok){
        response.json().then(json => {
          let course = this.state.course;
          course.hasChanged = false;
          if (course.isNew){
            course.id = json.published_course_id;
            course.isNew = false;
          }

          this.setState({
            course: course,
            hasSaved: true,
            showSaveError: false,
            showDeleteButton: data.is_published,
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
    if (course.cpd.is_private || course.cpd.is_na || course.cpd.is_tbc){
      course.cpd.points = null;
    }

    if (course.cpd.is_tbc){
      course.cpd.is_private = false;
      course.cpd.is_na = false;
      validCpd = true;
    }

    if (course.cpd.is_na){
      course.cpd.is_tbc = false;
      course.cpd.is_private = false;
      validCpd = true;
    }

    if (course.cpd.is_private){
      course.cpd.is_na = false;
      course.cpd.is_tbc = false;
      validCpd = true;
    }

    // validate CPD
    if (course.cpd.points != null && 
      (course.cpd.is_private || course.cpd.is_na || course.cpd.is_tbc)){
      validCpd = false;
    }

    if (course.cpd.points != null && 
      !(course.cpd.is_private || course.cpd.is_na || course.cpd.is_tbc)){
      validCpd = true;
    }

    if (course.cpd.points == null && 
      !(course.cpd.is_private || course.cpd.is_na || course.cpd.is_tbc)){
      validCpd = false;
    }

    if (course.cpd.points < 0){
      validCpd = false;
    }


    let validCost = false;
    if (course.cost.isVarying){
      validCost = true;
    }
    else{
      validCost = parseFloat(course.cost.cost, 10) ===
        Math.abs(parseFloat(Math.round(course.cost.cost * 100) / 100));
    }

    const validName = course.name.trim().length > 0;
    const validUrl = course.url.trim().length > 0;
    const validLevel = this.props.levels.indexOf(course.level) > -1;
    const validFormat = this.props.formats.indexOf(course.format) > -1;
    const validProvider = course.provider != null && 
      course.provider.trim().length > 0;

    const parseDateStr = d => {
      const sp = d.split("/");
      const day = sp[0];
      const month = sp[1];
      const year = sp[2];
      return parse(month + "/" + day + "/" + year);
    }

    const isValidDate = d => {
      const dateRe = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      if (dateRe.test(d)){
        return isValid(parseDateStr(d));
      }
      return false;
    };

    const isValidDateRange = dateRange => {
      const sp = dateRange.split("-").map(s => s.trim());
      if (!sp.every(isValidDate)){
        return false;
      }

      if (sp.length === 2){
        const start = parseDateStr(sp[0]);
        const end = parseDateStr(sp[1]);
        if (end < start){
          return false;
        }
      }

      if (sp.length === 0){
        return false;
      }

      return true;
    }

    const dateRanges = course.date_ranges.filter(d => d.length > 0);
    const validDateRanges = 
      dateRanges.length > 0 && 
      dateRanges.every(isValidDateRange);

    const validDateInfo = course.is_ongoing || validDateRanges;

    const keysAreUnique = dicts => {
      for (let i=0; i < dicts.length; i++){
        for (let j=0; j < dicts.length; j++){
          if (i !== j 
              && dicts[i].vertical_name === dicts[j].vertical_name
              && dicts[i].vertical_category_name === dicts[j].vertical_category_name){
            return false;
          }
        }
      }
      return true;
    }

    const validLiftedKeys = 
      course.lifted_keys.length > 0 &&
      keysAreUnique(course.lifted_keys) &&
      course.lifted_keys.every(
        lifted_key => lifted_key.vertical_name != null &&
                      lifted_key.vertical_category_name != null
      );

    let valid = (
      validCpd &&
      validName &&
      validProvider &&
      validUrl &&
      validCost &&
      validLevel &&
      validFormat &&
      validDateInfo &&
      validLiftedKeys);

    if (valid){
      course.date_ranges = dateRanges;
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
          dateRanges: !validDateInfo,
          liftedKeys: !validLiftedKeys,
          provider: !validProvider,
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
    if (this.state.course.isNew){
      this.props.handleDelete();
    }
    else{
      const payload = {
        id: this.props.course.id,
        is_published: !this.state.unpublished,
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
          disabled={this.state.hasSaved && this.state.unpublished}
          handleValueChange={this.handleNameChange}
          invalid={this.state.invalidFields.name}
          value={course.name} />
      </div>

    const urlInput =
      <div class="pure-u-1">
        <UrlInput
          disabled={this.state.hasSaved && this.state.unpublished}
          handleValueChange={this.handleUrlChange}
          invalid={this.state.invalidFields.url}
          value={course.url} />
      </div>

    const costInput =
      <div class="pure-u-2-5 pure-u-sm-2-5">
        <CostInput 
          disabled={this.state.hasSaved && this.state.unpublished}
          handleValueChange={this.handleCostChange}
          invalid={this.state.invalidFields.cost}
          value={course.cost} />
      </div>

    const cpdInput =
      <div class="pure-u-3-5 pure-u-sm-3-5">
        <CpdInput 
          disabled={this.state.hasSaved && this.state.unpublished}
          handleValueChange={this.handleCpdChange}
          invalid={this.state.invalidFields.cpd}
          value={course.cpd} />
      </div>

    const levelDropdown = 
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <LevelDropdown 
          disabled={this.state.hasSaved && this.state.unpublished}
          handleValueChange={this.handleLevelChange}
          invalid={this.state.invalidFields.level}
          value={course.level} levels={this.props.levels} />
      </div>

    const formatDropdown = 
      <div class="pure-u-1-2 pure-u-sm-2-5">
        <FormatDropdown 
          disabled={this.state.hasSaved && this.state.unpublished}
          handleValueChange={this.handleFormatChange}
          invalid={this.state.invalidFields.format}
          value={course.format} formats={this.props.formats} />
      </div>

    const providerInput =
      <div class="pure-u-1-1">
        <ProviderInput 
          disabled={this.state.hasSaved && this.state.unpublished}
          handleValueChange={this.handleProviderChange}
          invalid={this.state.invalidFields.provider}
          value={course.provider} />
      </div>

    const liftedKeyInput =
      <div class="pure-u-1">
        <LiftedKeyInput
          disabled={this.state.hasSaved && this.state.unpublished}
          values={course.lifted_keys}
          verticals={this.props.verticals}
          invalid={this.state.invalidFields.liftedKeys}
          handleValueChange={this.handleLiftedKeyChange}
        />
      </div>

    const saveOrPublish = this.state.unpublished ? "Publish" : "Save";

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

          {this.state.hasSaved && this.state.unpublished &&
            <label class="success_msg">Course published. To edit it, go 
              to <a href={"/cms/courses/published#" 
                  + this.state.publishedCourseId.toString()}
              >Published Courses</a>.</label>
          }

          {this.state.hasSaved && !this.state.unpublished &&
             !(this.state.course.hasChanged && this.state.hasSaved) && 
             <label class="success_msg">Course saved.</label>
          }
        </div>
      </div>

    const scrapedFrom =
      <div class="pure-u-1">
        {course.spider_name != null && !course.is_manually_added &&
          <div>
            <label>Scraped from:</label> {course.spider_name}
          </div>
        }
        {course.is_manually_added && !course.isNew &&
          <p>This entry was manually added.</p>
        }
      </div>

    let className = "editor " + (this.props.index % 2 === 0 ? "grey_bg" : "");

    // For unpublished courses:
    if (this.state.unpublished){
      return (
        <div class={className}>
          {nameInput}
          {urlInput}
          {costInput}
          {cpdInput}
          <br />
          {levelDropdown}
          {formatDropdown}
          {providerInput}

          <div class="pure-u-1">
            <DatesInput 
              disabled={this.state.hasSaved && this.state.unpublished}
              handleValueChange={this.handleDatesChange}
              handleOngoingChange={this.handleOngoingChange}
              invalid={this.state.invalidFields.dateRanges}
              is_ongoing={course.is_ongoing}
              values={course.date_ranges} />
          </div>

          {liftedKeyInput}

          {scrapedFrom}

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
        {providerInput}
        <br />

        <div class="pure-u-1">
          <DatesInput 
            disabled={this.props.disabled}
            handleValueChange={this.handleDatesChange}
            handleOngoingChange={this.handleOngoingChange}
            invalid={this.state.invalidFields.dateRanges}
            is_ongoing={course.is_ongoing}
            values={course.date_ranges} />
        </div>

        {liftedKeyInput}

        {scrapedFrom}
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
        <label><a href={this.state.value} target="_blank">URL:</a></label>
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


class CostInput extends Component{
  constructor(props){
    super(props);
    this.state = {
      cost: this.props.value.cost,
      isVarying: this.props.value.isVarying,
      invalid: false,
    };
  }


  componentWillReceiveProps = newProps => {
    if (this.state.cost !== newProps.value.cost ||
      this.state.isVarying !== newProps.value.isVarying ||
      this.state.invalid !== newProps.invalid){
      this.setState({
        cost: newProps.value.cost,
        isVarying: newProps.value.isVarying,
        invalid: newProps.invalid,
      });
    }
  }


  handleCostChange = cost => {
    if (cost === ""){
      cost = null;
    }
    if (this.state.cost !== cost){
      this.setState({ cost }, () => {
        this.props.handleValueChange(cost, false);
      });
    }
  }


  handleVaryingInputCheck = e => {
    const isVarying = e.target.checked;

    this.setState({ isVarying }, () => {
      this.props.handleValueChange(this.state.points, isVarying);
    });
  }

  render(){
    return(
      <div class={renderClassname(this.state.invalid, "custom_input")}>
        <div class="pure-u-2-5">
          <label>Cost ($):</label>
          {this.state.isVarying ?
            <label>Varies</label>
              :
            <input 
              class="cost_input"
              disabled={this.props.disabled}
              type="number" 
              min="0"
              step="0.01"
              onKeyUp={e => {this.handleCostChange(e.target.value)}}
              onChange={e => {this.handleCostChange(e.target.value)}}
              value={this.state.cost} />
          }
        </div>

        <div class="pure-u-2-5">
          <label>Varies?</label>
          <input class="cost_is_varying_input"
            disabled={this.props.disabled}
            type="checkbox" 
            ref={x => {this.isVarying = x}}
            onChange={this.handleVaryingInputCheck}
            checked={this.state.isVarying} />
        </div>
      </div>
    );
  }
}


class ProviderInput extends TextInput{
  render(){
    return(
      <div class={renderClassname(this.state.invalid, "custom_input")}>
        <label>Provider:</label>
        <input 
          class="provider_input"
          disabled={this.props.disabled}
          type="text" 
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
        is_private: this.props.value.is_private,
        is_tbc: this.props.value.is_tbc,
        is_na: this.props.value.is_na,
        invalid: this.props.invalid,
      };
    }
  }


  componentWillReceiveProps = newProps => {
    if (newProps.value){
      if (this.state.points !== newProps.value.points ||
        this.state.is_private !== newProps.value.is_private ||
        this.state.is_na !== newProps.value.is_na ||
        this.state.invalid !== newProps.invalid){
        this.setState({
          blank: false,
          points: newProps.value.points,
          is_private: newProps.value.is_private,
          is_tbc: newProps.value.is_tbc,
          is_na: newProps.value.is_na,
          invalid: newProps.invalid,
        });
      }
    }
  }


  handlePrivateInputCheck = e => {
    const is_private = e.target.checked;

    this.setState({ 
      is_private: is_private,
      is_tbc: false,
      is_na: false,
    }, () => {
      this.props.handleValueChange(this.state.points, is_private, false, false);
    });
  }


  handleTbcInputCheck = e => {
    const is_tbc = e.target.checked;

    this.setState({ 
      is_tbc: is_tbc,
      is_private: false,
      is_na: false,
    }, () => {
      this.props.handleValueChange(this.state.points, false, is_tbc, false);
    });
  }


  handleNaInputCheck = e => {
    const is_na = e.target.checked;

    this.setState({ 
      is_tbc: false,
      is_private: false,
      is_na: true
    }, () => {
      this.props.handleValueChange(this.state.points, false, false, is_na)
    });
  }


  handlePointsChange = points => {
    if (points === ""){
      points = null;
    }
    if (this.state.points !== points){
      this.setState({ 
        points,
        is_tbc: false,
        is_private: false,
        is_na: false,
      }, () => {
        this.props.handleValueChange(points, false, false);
      });
    }
  }


  render(){
    const pointsInput = (
      <input class="cpd_points_input" 
        disabled={this.props.disabled}
        type="number" placeholder={this.state.is_private ? "Private" : "(points)"} 
        min="0"
        onKeyUp={e => {this.handlePointsChange(e.target.value)}}
        onChange={e => {this.handlePointsChange(e.target.value)}}
        onClick={e => {this.handlePointsChange(e.target.value)}}
        value={this.state.is_private ? "Private" : this.state.points} />
    );

    return(
      <div class={renderClassname(this.state.invalid, "custom_input")}>
        <div class="pure-u-1-5">
          <label>CPD:</label>

          {this.state.is_private ?
              <label class="cpd_points_private">Private</label>
              :
              {pointsInput}
          }

          {this.state.is_tbc ?
              <label class="cpd_points_private">TBC</label>
              :
              {pointsInput}
          }

          {this.state.is_na ?
              <label class="cpd_points_private">N/A</label>
              :
              {pointsInput}
          }

          {!this.state.is_tbc && !this.state.is_private && !this.state.is_na &&
            pointsInput
          }
        </div>

        <div class="pure-u-3-5">
          <div class="pure-u-2-3">
            <label>Private?</label>
            <input class="cpd_is_private_input"
              disabled={this.props.disabled}
              type="checkbox" 
              onChange={this.handlePrivateInputCheck}
              checked={this.state.is_private} />
          </div>
          <div class="pure-u-2-3">
            <label>TBC?</label>
            <input class="cpd_is_private_input"
              disabled={this.props.disabled}
              type="checkbox" 
              onChange={this.handleTbcInputCheck}
              checked={this.state.is_tbc} />
          </div>
          <div class="pure-u-2-3">
            <label>N/A?</label>
            <input class="cpd_is_private_input"
              disabled={this.props.disabled}
              type="checkbox" 
              onChange={this.handleNaInputCheck}
              checked={this.state.is_na} />
          </div>
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
      is_ongoing: this.props.is_ongoing,
    };
  }


  componentWillReceiveProps = newProps => {
    if (this.state.values !== newProps.values ||
        this.state.is_ongoing !== newProps.is_ongoing ||
        this.state.invalid !== newProps.invalid){
      this.setState({
        values: newProps.values,
        invalid: newProps.invalid,
        is_ongoing: newProps.is_ongoing,
      });
    }
  }


  handleValueChange = values => {
    this.setState({ values }, () => {
      this.props.handleValueChange(values);
    });
  }


  handleOngoingInputChecked = e => {
    const is_ongoing = e.target.checked;
    this.setState({ 
      is_ongoing: is_ongoing,
      value: [],
    }, () => {
      this.props.handleOngoingChange(is_ongoing);
    });
  }


  render(){
    return(
      <div>
        <div class="pure-u-1 custom_input ongoing_input">
          <label>Ongoing?</label>
          <input 
            type="checkbox" 
            disabled={this.props.disabled}
            checked={this.state.is_ongoing}
            onChange={this.handleOngoingInputChecked}
          />
        </div>
        <div class="pure-u-1">
          <div class={renderClassname(this.state.invalid, "dates_input")}>
            <label>Dates (SGT):</label>
            {this.state.is_ongoing ?
                <span>Ongoing courses don't have dates</span>
                :
                <DateListInput
                disabled={this.props.disabled}
                handleValueChange={this.handleValueChange}
                values={this.state.values}
              />
            }
          </div>
        </div>
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
            <p class="empty">(no entries)</p>
          }

          {this.state.items.map((item, index) => 
            <DateListInputItem 
              disabled={this.props.disabled}
              handleValueChange={value => this.updateItem(index, value)}
              handleRemoveItem={() => this.removeItem(index)}
              placeholder="dd/mm/yyyy - dd/mm/yyyy"
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
          onChange={e => this.handleValueChange(e.target.value)}
          type="text" 
          maxlength="25" placeholder={this.props.placeholder} 
          value={this.state.value} />
        {!this.props.disabled &&
          <span
            onClick={this.props.handleRemoveItem}
            title="Remove date" 
            class="remove_btn no_user_select">✕</span>
        }
      </div>
    );
  }
}
