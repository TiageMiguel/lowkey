//#region Tenor Inicialization

const TenorAPI = 'add tenor api key';
const TenorLMT = 50;

httpGetAsync = (url, callback) => {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

TenorHome = () => {
    $('#tenor-categories').removeClass('hide');
    $('#tenor-searched').addClass('hide');
    $('#tenor-home').addClass('hide');
    $('#tenor-searched').empty();
    $('#tenor-search').val('');
    $('#tenor-noresults').addClass('hide');
}

$('#tenor-form').submit(event => {
    TenorSearchAttribution();
    event.preventDefault();
});

//#endregion

//#region Tenor Categories
TenorCategories = async () => {
    const url = "https://api.tenor.com/v1/categories?key=" + TenorAPI;
    await httpGetAsync(url, (data) => {
        data = JSON.parse(data);
        const { tags } = data;
        tags.forEach(data => {
            const { searchterm, path, image, name } = data;
            $('#tenor-categories').append(`
            <div class="col s6 m4 l3">
                <div class="container">
                    <div tenor="${searchterm}" class="card rounded dark darken-3 darken-1" style="height:150px; cursor: pointer !important;" onclick="TenorCategoriesSearch(this);">
                        <div class="card-image" pointer style="width:100%; height:100%; cursor: pointer !important;">
                            <img src="${image}" class="rounded pointer" style="width:100%; height:100%; filter:brightness(60%); cursor: pointer !important;">
                            <span class="card-title" style="cursor: pointer !important;">${searchterm}</span>
                         </div>
                    </div>
                </div>
            </div>`);
        });
    });
}
TenorCategories();
TenorCategoriesSearch = (el) => {
    const search = $(el).attr('tenor');
    TenorSearch(search);
}
//#endregion
//#region Tenor Search
TenorSearchAttribution = () => {
    const search = $('#tenor-search').val();
    $('#tenor-searched').empty();
    TenorSearch(search);
}
TenorSearch = (search) => {
    const url = "https://api.tenor.com/v1/search?tag=" + search + "&key=" + TenorAPI + "&limit=" + TenorLMT;
    httpGetAsync(url, async (data) => {
        data = JSON.parse(data);
        const { results } = data;
        console.log(results);
        if (results.length == 0) {
            $('#tenor-noresults').removeClass('hide');
        } else {
            await results.forEach(gif => {

            const { media } = gif;
            const { tinygif } = media[0];
            const { url } = tinygif;

            $('#tenor-searched').append(`
                <div class="col s6 m4 l3">
                    <div class="container">
                        <div tenor="${url}" class="card rounded dark darken-3 darken-1 pointer" style="height:150px;" onclick="sendTenorToMessage(this);">
                            <div class="card-image pointer" style="width:100%; height:100%;">
                                <img src="${url}" class="rounded pointer" style="width:100%; height:100%; filter:brightness(60%);">
                            </div>
                        </div>
                    </div>
                </div>`);
            });
            $('#tenor-noresults').addClass('hide');
        }

        $('#tenor-categories').addClass('hide');
        $('#tenor-searched').removeClass('hide');
        $('#tenor-home').removeClass('hide');
    });
}
//#endregion
