import logo from './logo.svg';
import './App.css';
import Rushil from './Rushil.js'
import React, {useRef} from "react";
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";
import { Button } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import foot from "./l2.png";


function setLegPosition(x, y) {
  var item = document.getElementById("pro");
  var x2 = x + 200;
  var y2 = y + 600;

  item.style.display = '';
  item.style.position = 'absolute';
  item.style.left = x2 + 'px';
  item.style.top = y2 + 'px';
}

// 0 = nothing is amputated
// 1 = left Leg
// 2 = right leg
// 3 = left arm
// 4 = right arm
var amputated = 0;

function leftLeg() {
  alert("left leg selected");
  amputated = 1;
  console.log("hit Left Leg Selected", amputated);
}

function rightLeg() {
  alert("right leg selected")
  amputated = 2;
  console.log("hit Right Leg Selected", amputated);
}

function leftArm() {
  alert("left arm selected")
  amputated = 3;
  console.log("hit Left Arm Selected", amputated);
}

function rightArm() {
  alert("right arm selected");
  amputated = 4;
  console.log("hit Right Arm Selected", amputated);
}

//find coordanites of required limb 
//find coordanites of component connecting to required limb
//extrapolate coordanates and calculate new coordanites

function RightArmPredict(detect) {
  try {
    var shoulderX = detect.allPoses[0].keypoints[6].position.x 
    var shoulderY = detect.allPoses[0].keypoints[6].position.y
    var shoulderScore = detect.allPoses[0].keypoints[6].score
    var elbowX = detect.allPoses[0].keypoints[8].position.x
    var elbowY = detect.allPoses[0].keypoints[8].position.y
    var elbowScore = detect.allPoses[0].keypoints[8].score
  } catch (error) {
    //console.log("Could not determine shoulder position model")
  }
  if(shoulderScore >= .75 && elbowScore >= .75)
  {
    //console.log("hipX ", hipX, "hipY", hipY, "kneeX", kneeX, "kneeY", kneeY)
    console.log("elbowX", elbowX, "elbowY", elbowY)

    var yOffset = (elbowY- shoulderY)
    var xOffset = (elbowX-shoulderX)
    var newX = elbowX+ xOffset
    var newY = elbowY + yOffset 
    var answer = [newX, newY];
    //console.log("hit", answer);
    return answer;
  }
}

function LeftArmPredict(detect) {
  try {
    var shoulderX = detect.allPoses[0].keypoints[5].position.x 
    var shoulderY = detect.allPoses[0].keypoints[5].position.y
    var shoulderScore = detect.allPoses[0].keypoints[5].score
    var elbowX = detect.allPoses[0].keypoints[7].position.x
    var elbowY = detect.allPoses[0].keypoints[7].position.y
    var elbowScore = detect.allPoses[0].keypoints[7].score
  } catch (error) {
    //console.log("Could not determine shoulder position model")
  }
  if(shoulderScore >= .75 && elbowScore >= .75)
  {
    //console.log("hipX ", hipX, "hipY", hipY, "kneeX", kneeX, "kneeY", kneeY)
    console.log("elbowX", elbowX, "elbowY", elbowY)

    var yOffset = (elbowY- shoulderY)
    var xOffset = (elbowX-shoulderX)
    var newX = elbowX+ xOffset
    var newY = elbowY + yOffset 
    var answer = [newX, newY];
    //console.log("hit", answer);
    return answer;
  }
}

function RightLegPredict(detect) {
  try {
    var hipX = detect.allPoses[0].keypoints[12].position.x 
    var hipY = detect.allPoses[0].keypoints[12].position.y
    var hipScore = detect.allPoses[0].keypoints[12].score
    var kneeX = detect.allPoses[0].keypoints[14].position.x
    var kneeY = detect.allPoses[0].keypoints[14].position.y
    var kneeScore = detect.allPoses[0].keypoints[14].score
  } catch (error) {
    //console.log("Could not determine hip position model")
  }
  
  if(hipScore >= .85 && kneeScore >= .85)
  {
    //console.log("hipX ", hipX, "hipY", hipY, "kneeX", kneeX, "kneeY", kneeY)
    //console.log("kneeX", kneeX, "kneeY", kneeY)

    var yOffset = .7*(kneeY - hipY)
    var xOffset = .7*(kneeX - hipX)
    var newX = kneeX + xOffset
    var newY = kneeY + yOffset 
    var answer = [newX, newY];
    //console.log("hit", answer);
    return answer;
  }
}

function LeftLegPredict(detect) {
  try {
    var hipX = detect.allPoses[0].keypoints[11].position.x 
    var hipY = detect.allPoses[0].keypoints[11].position.y
    var hipScore = detect.allPoses[0].keypoints[11].score
    var kneeX = detect.allPoses[0].keypoints[13].position.x
    var kneeY = detect.allPoses[0].keypoints[13].position.y
    var kneeScore = detect.allPoses[0].keypoints[13].score
  } catch (error) {
    //console.log("Could not determine hip position model")
  }

  if(hipScore >= .85 && kneeScore >= .85)
  {
    //console.log("hipX ", hipX, "hipY", hipY, "kneeX", kneeX, "kneeY", kneeY)
    //console.log("kneeX", kneeX, "kneeY", kneeY)

    var yOffset = .7*(kneeY - hipY)
    var xOffset = .7*(kneeX - hipX)
    var newX = kneeX + xOffset
    var newY = kneeY + yOffset 
    var answer = [newX, newY];
    //console.log("hit", answer);
    return answer;
  }
}



function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runBodysegment = async () => {
    const net = await bodyPix.load();
    console.log("Bodypix model loaded.")
    setInterval(() => {
      detect(net);
    }, .01);
  };

  const detect = async (net) =>{
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null && 
      webcamRef.current.video.readyState === 4
    ) {
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;
        const detect = await net.segmentPersonParts(video);
        

        //RIGHT ARM\\
        /*try {
          var answer = RightArmPredict(detect)
          console.log("Predict X", answer[0], "Predict Y", answer[1])

        } catch (error) {
          console.log("Could not determine arm position model")
        }*/

        //RIGHT LEG\\
       /*try {
          var answer = RightLegPredict(detect)
          //console.log("Predict X", answer[0], "Predict Y", answer[1])
          setLegPosition(answer[0], answer[1]);

        } catch (error) {
          //console.log("Could not determine hip position model")
        }*/

        //LEFT LEG\\
       try {
        var answer = LeftLegPredict(detect)
        //console.log("Predict X", answer[0], "Predict Y", answer[1])
        setLegPosition(answer[0], answer[1]);

      } catch (error) {
        //console.log("Could not determine hip position model")
      }
        
        //draw overlay
        /*const coloredPartImage = bodyPix.toColoredPartMask(detect);

        bodyPix.drawMask(
          canvasRef.current, //parse current canvas
          video, //parse video
          coloredPartImage, //colored mask
          0.7, //opacity
          0, //blur
          false //image flip
        );*/
    }
  };


  runBodysegment();

  return (
    <div className="App">
      <img src={foot} id="pro" className="prosthetic"></img>
      <div className="loginClass">
            <h1>Hello! What is amputated?</h1>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Button variant="contained" color="#12E4D5" onClick={leftLeg}>Left Leg</Button>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="#12E4D5" onClick={rightLeg}>Right Leg</Button>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="#12E4D5" onClick={leftArm}>Left Arm</Button>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="#12E4D5" onClick={rightArm}>Right Arm</Button>
                </Grid>
            </Grid>
        </div>
      <header className="App-header">
        <Webcam ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
         <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      
      </header>


    </div>
    
  );
}

export default App;
