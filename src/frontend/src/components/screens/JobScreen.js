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

          <div class="sal_logo">
            <a href="http://www.sal.org.sg/" target="_blank">
              <img src="/static/app/dist/images/sal_logo.png" />
            </a>
          </div>

          <div class="intro">
            <div class="text">
              <p>Part of the legal community?</p>
              <p>Find out what to learn.</p>
            </div>
          </div>

					<Question
            qnNum={this.props.qnNum}
						isMultiQn={false}
						handleAnswerSelect={this.handleAnswerSelect}
						qnData={this.props.qnData} 
					/>

          <div class="credits">
            <p>
            This app is part of the <a href="http://www.sal.org.sg/Resources-Tools/Legal-Education/LIFTED/Overview">Legal Industry Framework for Training and Education
              </a>, an initiative of the <a href="http://www.sal.org.sg">
                Singapore Academy of Law
              </a>.
            </p>
            {/*
            <p>
              <a href="/terms" target="_blank">
                Click here to view this site's terms of use and
                associated software licenses.
              </a>
            </p>
            */}
          </div>
				</div>
      </div>
    );
  }
}


