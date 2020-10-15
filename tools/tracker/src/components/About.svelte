<script>
  import { version, repository } from '../../package.json';
</script>

<div>
  <h1>ZzFXM Music Tracker</h1>
  v{ version }
  <p>by <a href="https://keithclark.co.uk">Keith Clark</a></p>
  <p>Source available at the <a target="_blank" href="{repository.url}/tree/master/tools/tracker">ZzFXM GitHub Repo</a></p>
</div>

<style>
div {
  text-align: center;
}
h1 {
  background: linear-gradient(90deg, rgb(255,85,18), rgb(247,255,15) 25%, rgb(5,193,255) 50%, rgb(171,69,255) 75%, rgb(255,85,18));
  background-size:2000px 2em;
  background-repeat: repeat-x;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(1px 1px 0px #0004);
  animation: 10s colorshock linear infinite;
  font-size:250%;
  letter-spacing: -0.06em;
}
@keyframes colorshock {
  from {
    background-position:2000px 0;
  }
}
</style>