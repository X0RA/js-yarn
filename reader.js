function getDialogue() {
  return new Promise(function (resolve) {
    fetch("https://dl.dropboxusercontent.com/s/9svbn6yvtod3boa/dialogue.json")
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
    for (let index = 1; index < text.length; index++) {
    all_text.append(`<span class="dot"></span>`)
    } 
  } else {
    $(".dot:first").remove()
  }
  if (index < text.length) {
    if(text[index].dialogue) {
      all_text.append(`<p id="dialogue">${text[index].text}</p>`)
    } else {
      all_text.append(`<p id="storytext">${text[index].text}</p>`)
    }
    index++
    if (index <= text.length) {
      $('#text').unbind('click').on('click', function () {
        renderText(text, index)
      });
    } else {
      $('#text').unbind('click')
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
        //This is a bit gross but pretty much the video element hasn't fully been created at this point
        setTimeout(() => {
          r()
        }, 1000);
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