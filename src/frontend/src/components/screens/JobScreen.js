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
          <div class="intro">
            <p>
              Are you part of the legal industry?
            </p>
            <p>
              Use this tool to hone your career development and
              professional learning choices.
            </p>
          </div>
					<Question
            qnNum={this.props.qnNum}
						isMultiQn={false}
						handleAnswerSelect={this.handleAnswerSelect}
						qnData={this.props.qnData} 
					/>

          <p class="credits">
            This app is part of the <a href="http://www.sal.org.sg/Resources-Tools/Legal-Education/LIFTED/Overview">Legal Industry Framework for Training and Education</a>, an initiative of the <a 
              href="http://www.sal.org.sg">Singapore Academy of Law</a>.
          </p>
				</div>
      </div>
    );
  }
}


