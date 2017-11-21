import { h, Component } from 'preact';


export class IntroScreen extends Component{
  render(){
    return(
      <div class="pure-g">
        <div class="pure-u-1">
          <div class="sal_logo no_user_select">
            <img alt="LIFTED Mobile - Singapore Academy of Law"
                 src="/static/app/dist/images/sal_logo.png" />
          </div>

          <div class="intro">
            <div class="text">
              <p>Find out what to learn with LIFTED.</p>
            </div>
            <div class="planes no_user_select">
              <img src="/static/app/dist/images/lifted_planes.png" />
            </div>
          </div>

          <div class="intro_option">
            <a href="/browse">
              <div class="icon">
                <img src="/static/app/dist/images/intro_courses.png" />
              </div>
              <div class="desc">
                <h2>Browse courses</h2>
                <p>Locate CPD courses from various providers.</p>
              </div>
            </a>
          </div>

          <div class="intro_option">
            <a href="/analysis">
              <div class="icon">
                <img src="/static/app/dist/images/intro_tailored.png" />
              </div>
              <div class="desc">
                <h2>Get tailored course suggestions</h2>
                <p>Take a holistic learning needs analysis.</p>
              </div>
            </a>
          </div>

          <div class="intro_option">
            <a href="/tech">
              <div class="icon">
                <img src="/static/app/dist/images/intro_tech.png" />
              </div>
              <div class="desc">
                <h2>Hone your legal tech skills</h2>
                <p>Find out how to improve in legal technology.</p>
              </div>
            </a>
          </div>

          <div class="credits">
            <p>
              This app is part of the <a href="https://www.sal.org.sg/lifted">
              Legal Industry Framework for Training and Education</a>, an 
              initiative of the <a href="https://www.sal.org.sg">
              Singapore Academy of Law</a>.
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

