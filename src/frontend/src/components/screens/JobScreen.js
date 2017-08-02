import { h, Component } from 'preact';
import Question from '../Question';
import {Screen} from './Screen';

export {JobScreen};

class JobScreen extends Screen{
  constructor(props){
    super(props);
    sessionStorage.removeItem("selectedAnswers");
  }


  render = () => {
    return (
      <div className="pure-g">
        <div className="pure-u-1">
					<Question
            qnNum={this.props.qnNum}
						isMultiQn={false}
						handleAnswerSelect={this.handleAnswerSelect}
						qnData={this.props.qnData} 
					/>
          <div class="preload_lato_bold">&nbsp;</div>
				</div>
      </div>
    );
  }
}


