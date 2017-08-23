import { h, Component } from 'preact';

export default class Question extends Component{
  constructor(props){
    super(props);

    this.QN_TYPES = {
      SINGLE: 0,
      MULTI: 1,
    };

    this.type = this.QN_TYPES.SINGLE;
    if (this.props.isMultiQn){
      this.type = this.QN_TYPES.MULTI;
    }
  }


  componentWillMount = () => {
    this.setState({
      preSelected: this.props.preSelected,
      showOptions: false,
      optionsVisible: true,
    });
  }


  onAnswerClick = selectedIndex => {
    if (this.type === this.QN_TYPES.SINGLE){
      this.props.handleAnswerSelect(selectedIndex, this.props.isMultiQn);
    }
    else if (this.type === this.QN_TYPES.MULTI){
      let index = this.state.preSelected.indexOf(selectedIndex);
      let preSelected;

      if (index > -1){
        preSelected = this.state.preSelected.concat();
        preSelected.splice(index, 1);
      }
      else if (index === -1){
        preSelected = this.state.preSelected.concat([selectedIndex])
      }

      this.setState({
        preSelected: preSelected
      }, () => {
        this.props.handleAnswerSelect(preSelected, this.props.isMultiQn);
      });
    }
  }


  toggleOptions = () => {
    this.setState({
      showOptions: !this.state.showOptions,
      optionsVisible: !this.state.optionsVisible,
    });
  }


  render(){
    const qnData = this.props.qnData;
    const onAnswerClick = this.onAnswerClick;
    const tick = "✔";
    const options = qnData.options;

    let optionBtns = [];

    let optionTextClass = "option text";
    if (this.props.isMultiQn){
      optionTextClass += " multi_option_text";
    }

    // Display questions and options.
    options.forEach((option, i) => {
      let optionDesc;

      let answerClass = "answer";

      if (this.state.preSelected){
        if (this.state.preSelected.indexOf(i) > -1){
          answerClass += " selected";
        }
      }

      if (this.props.useTiles){
        answerClass += " tile";
      }

      let optionElm;

      optionElm = (
        <div class={optionTextClass}>
          {option.text}
          {optionDesc}
        </div>
      );

      optionBtns.push(
        <div>
          <div key={i} 
               class={answerClass}
               onClick={() => {this.onAnswerClick(i)}}>
            {this.props.isMultiQn &&
              <div class="option_tick">
                {tick}
              </div>
            }
            {optionElm}
          </div>
        </div>
      );
    });

    if (this.props.clickToShow && qnData.text){
      let optionsClass = "goals";
      if (this.state.showOptions){
        optionsClass += "show";
      }
      return (
        <div className="question">
          <h1>{qnData.text}</h1>

            <div class="toggle" onClick={this.toggleOptions}>
              <div class="toggle_title">
              {this.state.optionsVisible ?
                <p>Click to view: <span class="toggle_arrow">▼</span></p>
                :
                <p>Click to hide: <span class="toggle_arrow">▲</span></p>
              }
              </div>
            </div>

          <div class={optionsClass}>
            {optionBtns}
          </div>
        </div>
      );
    }
    else{
      return (
        <div className="question">
          {qnData.text && <h1>{qnData.text}</h1>}
          {optionBtns}
        </div>
      );
    }
  }
}
