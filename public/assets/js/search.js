// const locale = !{ locale };
const locale = 'en-US';

async function search() {
  console.log('123123');
  await axios.get(`/api/1.0/movie/search?keyword=${$('#searchText').val()}&locale=${locale}`);
  window.location.href = `/movie/search?keyword=${$('#searchText').val()}&locale=${locale}`;
}
$('#searchText').keypress(async (event) => {
  if (event.key === 'Enter') {
    await search($('#searchText').val());
    // console.log('123123');
    // window.location.href = `/movie/search?keyword=${$('#searchText').val()}&locale=${locale}`;
  }
});
