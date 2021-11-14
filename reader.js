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

function renderNode(node) {
  node_info = {
    text_prompt: node.body.split("[")[0],
    options: Array.from(node.body.matchAll(/\[([^\][[]*)]]/g), (x) => ({
      text_prompt: x[1].split("|")[0],
      next_node: x[1].split("|")[1],
    })),
    img: Array.from(node.body.matchAll(/\img](.*?)\[\/img/g), (x) => x[1])[0],
  };
  if(node.image == undefined) {
    flavour_img.empty()
    flavour_img.animate({height:'0px'}, 250);
  } else {
    flavour_img.animate({height:'500px'}, 250);
    flavour_img.html(node.image);
  }
  options.empty();
  dialogue_text.text(node_info.text_prompt);
  node_info.options.forEach((option, index) => {
    options.append(
      `<td id='${option.next_node}'><p class='col' >${option.text_prompt}</p> </td>`
    );
  });
  $("td").click(function () {
    next_node = text_json.find((node) => node.title === $(this).attr("id"));
    renderNode(next_node);
  });
}
const preloadImage = (src, node) =>
  new Promise((r) => {
    node.image = new Image();
    node.image.onload = r;
    node.image.id = "flavour_img";
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
        y.setAttribute("type", "video/webm");
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
      $("body")
        .html(`<div class="position-absolute top-50 start-50 translate-middle">
        <div id='flavour_img'></div>
            <p id="dialogue"></p>
            <table class='table'>
                <tr id="options"></tr>
            </table>
          </div>`);
      flavour_img = $("#flavour_img");
      dialogue_text = $("#dialogue");
      options = $("#options");
      node = text_json.find((node) => node.title === "Start");
      node_info = renderNode(node);
    });
  });
});