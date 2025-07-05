const web = document.getElementById('web');
const js = document.getElementById('js');
const ts = document.getElementById('ts');
const php = document.getElementById('php');
const rust = document.getElementById('rust');

web.addEventListener('click', () => {
    window.location.href = './langs/web/';
});

js.addEventListener('click', () => {
    window.location.href = './langs/js/';
});

ts.addEventListener('click', () => {
    window.location.href = './langs/ts/';
});

php.addEventListener('click', () => {
    window.location.href = './langs/php/';
});

rust.addEventListener('click', () => {
    window.location.href = './langs/rust/';
});

