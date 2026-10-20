
document.querySelectorAll(".user-image").forEach(function(img){
  function fail(){img.style.display="none";}
  img.addEventListener("error",fail);
  if(img.complete && img.naturalWidth===0)fail();
});
