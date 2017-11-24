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


  handleOptionClick = id => {
    if (this.type === this.QN_TYPES.SINGLE){
      this.props.handleOptionSelect(id);
    }
    else{
      let preSelected = this.state.preSelected;
      if (preSelected == null){
        preSelected = [];
      }

      let index = preSelected.indexOf(id);

      if (index > -1){
        preSelected.splice(index, 1);
      }
      else if (index === -1){
        preSelected = preSelected.concat([id])
      }

      this.setState({ preSelected }, () => {
        this.props.handleOptionSelect(preSelected);
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
    const options = qnData.options;

    let optionBtns = [];

    let optionTextClass = "option text";
    if (this.props.isMultiQn){
      optionTextClass += " multi_option_text";
    }

    // Display questions and options
    options.forEach((option, i) => {
      let answerClass = "answer no_user_select";

      if (this.state.preSelected){
        if (this.state.preSelected.indexOf(option.id) > -1){
          answerClass += " selected";
        }
      }

      if (this.props.useTiles){
        answerClass += " tile";
      }

      optionBtns.push(
        <div class={answerClass}
             onClick={() => {this.handleOptionClick(option.id)}}>
          {this.props.isMultiQn &&
            <div class="option_tick no_user_select">
              <img src="/static/app/dist/images/tick.png" />
            </div>
          }
          <div class={optionTextClass}>
            {option.text}
          </div>
        </div>
      );
    });

    return (
      <div className="question">
        {qnData.text && <h1>{qnData.text}</h1>}
        {this.props.isMultiQn &&
          <p class="choose_more_than_one">(you can choose more than one)</p>
        }
        {optionBtns}
      </div>
    );
  }
}
