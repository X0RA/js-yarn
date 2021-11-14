function getDialogue() {
  return new Promise(function (resolve) {
    fetch("JSON FILE HERE")
      .then((res) => res.json())
      .then((out) => {
        resolve(out);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function renderText(text, index) {
  if(index == 0){
    all_text.html('')
  }
  if (index < text.length) {
    if(text[index].dialogue) {
      all_text.append(`<p id="dialogue">${text[index].text}</p>`)
    } else {
      all_text.append(`<p id="storytext">${text[index].text}</p>`)
    }
    index++
    if (index <= text.length) {
      $('img').unbind('click').on('click', function () {
        renderText(text, index)
      });
    } else {
      $('img').unbind('click')
    }
  }
}


function animateFlavour(){
  var curHeight = flavour_content.height();
  flavour_content.css('height', 'auto');
  var autoHeight = flavour_content.height();
  flavour_content.height(curHeight).animate({height: autoHeight}, 350);
}

function renderNode(node) {
  node_info = {
    text: [],
    options: Array.from(node.body.matchAll(/\[([^\][[]*)]]/g), (x) => ({
      text_prompt: x[1].split("|")[0],
      next_node: x[1].split("|")[1],
    })),
    img: Array.from(node.body.matchAll(/\img](.*?)\[\/img/g), (x) => x[1])[0],
  };

  node.body.split("[")[0].split('\n').filter(n => n.length != 0).forEach(element => {
    if(element.match(/^.{1,12}\:\s/g) != null) {
      node_info.text.push({
        text: element,
        dialogue: true
      })
    } else {
      node_info.text.push({
        text: element,
        dialogue: false
      })
    }
  });



  if(node.image == undefined) {
    flavour_content.empty()
    animateFlavour()
  } else {
    flavour_content.html(node.image);
    animateFlavour()
  }
  renderText(node_info.text, 0)
  options.empty();
  node_info.options.forEach((option, index) => {
    options.append(
      `<td id='${option.next_node}'><p class='col' >${option.text_prompt}</p> </td>`
    );
  });
  $('td').css("width", (100 / node_info.options.length) + "%")
  $("td").click(function () {
    next_node = text_json.find((node) => node.title === $(this).attr("id"));
    renderNode(next_node);
  });
}
const preloadImage = (src, node) =>
  new Promise((r) => {
    node.image = new Image();
    node.image.onload = r;
    node.image.onerror = r;
    node.image.src = src;
  });

const preloadVideo = (src, node) =>
  new Promise((r) => {
      new Promise((resolve) => {
        fetch(src).then((data) => {
          return data.blob();
        }).then((blob) => {
          var url = window.URL.createObjectURL(blob);
          resolve(url);
        });
      }).then((url) => {
        node.image = document.createElement("VIDEO");
        node.image.setAttribute("controls", "controls");
        var y = document.createElement("SOURCE");
        y.setAttribute("src", url);
        y.setAttribute("type", "video/mp4");
        node.image.appendChild(y)
        node.image.reload = 'auto';
        r()
      })
  });

document.addEventListener("DOMContentLoaded", function () {
  node_position = "Start";
  text_json = getDialogue();
  text_json.then((dialogue) => {
    text_json = dialogue;
    image_promises = [];
    dialogue.forEach((element) => {
      temp_img = Array.from(element.body.matchAll(/\img](.*?)\[\/img/g), (x) => x[1])[0];
      temp_video = Array.from(element.body.matchAll(/video](.*?)\[\/video/g), (x) => x[1])[0];
      if (temp_img != undefined) {
        image_promises.push(preloadImage(temp_img, element));
      }
      if (temp_video != undefined) {
        image_promises.push(preloadVideo(temp_video, element));
      }
    });
    Promise.all(image_promises).then(() => {
      $("#content")
        .html(`
        <div id='flavour_content'></div>
        <div id='text'>
        </div>
            <table class='table'>
                <tr id="options"></tr>
            </table>`);
      flavour_content = $("#flavour_content");
      all_text = $('#text')
      options = $("#options");
      node = text_json.find((node) => node.title === "Start");
      node_info = renderNode(node);
    });
  });
});


// document.onclick = function() {
//   console.log('click')
// }

// var isMobile = false;
// if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
//     || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
//     isMobile = true;
// }
// console.log(isMobile);
// window.onresize = function() {

//   // if(window.innerWidth >= )
//   // $('#content').animate({width:'200px'}, 5);
  
// }