const DEFAULT_FILTERS = {
    Age: {},
    Availability: {},
    Genres: {},
    Author: {}
}

let filters = cloneObject(DEFAULT_FILTERS); //this is the global variable to be used for search results

function fetch_books() {
    show_search_loading_spinner();
    fetch("https://sheets.googleapis.com/v4/spreadsheets/" + SPREADSHEET_ID + "?key=" + GOOGLE_CLOUD_API_KEY + "&includeGridData=true")
        .then(response => response.json())
        .then(result => {
            let books = [];
            const spreadsheet = result;
            spreadsheet.sheets.forEach(function (sheet) {
                if (sheet.properties.title === "books") {
                    sheet.data.forEach(function (gridData) {
                        gridData.rowData.forEach(function (row, index) {
                            if (index < 1) { // header in spreadsheet
                                return;
                            }
                            try {
                                const id = row.values[0].formattedValue ? row.values[0].formattedValue : "";
                                const title = row.values[1].formattedValue ? row.values[1].formattedValue : "";
                                const author = row.values[2].formattedValue ? row.values[2].formattedValue : "";
                                const genre = row.values[3].formattedValue ? row.values[3].formattedValue : "";
                                const age_group = row.values[4].formattedValue ? row.values[4].formattedValue : "";
                                const available = row.values[5].formattedValue ? row.values[5].formattedValue : "";
                                const available_date = row.values[6].formattedValue ? row.values[6].formattedValue : "";
                                const description = row.values[7].formattedValue ? row.values[7].formattedValue : "";
                                const thumbnail_url = row.values[8].formattedValue ? row.values[8].formattedValue : "";
                                if (id === "") {
                                    return;
                                }
                                books.push({ id: id, title: title, author: author, genre: genre, age_group: age_group, available: available, available_date: available_date, description: description, thumbnail_url: thumbnail_url });
                            } catch (err) {
                                console.error(err);
                            }
                        });
                    });
                }
            });
            return books;
        })
        .then(books_data => on_books_fetched(books_data))
        .finally(() => {
            hide_search_loading_spinner();
        });
}

function convert_to_title_case(words) {
    words = words.toLowerCase();
    words = words.split(' ');
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
}

function get_filter_options(books) {
    for (let i in books) {
        let genre = books[i]["genre"];
        genre_title_case = convert_to_title_case(genre);
        if (!(genre_title_case in DEFAULT_FILTERS["Genres"])) {
            DEFAULT_FILTERS["Genres"][genre_title_case] = false;
        }

        let author = books[i]["author"];
        author_title_case = convert_to_title_case(author);
        if (!(author_title_case in DEFAULT_FILTERS["Author"])) {
            DEFAULT_FILTERS["Author"][author_title_case] = false;
        }

        let availability = books[i]["available"];
        availability_title_case = convert_to_title_case(availability);
        if (!(availability_title_case in DEFAULT_FILTERS["Availability"])) {
            DEFAULT_FILTERS["Availability"][availability_title_case] = false;
        }

        let age_group = books[i]["age_group"];
        age_group = age_group + " years";
        if (!(age_group in DEFAULT_FILTERS["Age"])) {
            DEFAULT_FILTERS["Age"][age_group] = false;
        }
    }
    filters = cloneObject(DEFAULT_FILTERS);
    console.log("default filters", DEFAULT_FILTERS);
    setup_filter_ui();
}

function on_books_fetched(books) {
    get_filter_options(books);
    const searchInput = get_query_parameter("q") || "";
    filter_books(books, searchInput, filters);
};
function filter_books(books, searchInput, filters) {
    // clear_books_search();
    function filterItems() {
        return books.filter(function (book) {
            const keys = ['title', 'author', 'genre'];
            return keys.some(function (key) {
                return book[key].toLowerCase().indexOf(searchInput.toLowerCase()) !== -1
            })

        })
    }
    const filtered_books = filterItems();
    console.log("filtered books", filtered_books);

    // const newFILTERS = ((author, age_group, genre, available) => {
    //     for (i = 0; i < books.length; i++) {
    //         if (books[i].contains(searchInput)) {
    //             books[i].style.display = "block";
    //         } else {
    //             books[i].style.display = "none";
    //         }
    //     }
    // });

};
function show_search_loading_spinner() {

}
function hide_search_loading_spinner() {

}

function close_filter_dialog_preview() {
    const filter_dialog = document.getElementsByClassName("filter-dialog")[0];
    filter_dialog.style.display = "none";

    filters = cloneObject(DEFAULT_FILTERS);
    const selected_filter_options = document.getElementsByClassName("selected-filter-option");
    for (let i = 0; i < selected_filter_options.length; i++) {
        filter_type = selected_filter_options[i].parentNode.dataset.optionsFor;
        filter_option_with_true_value = selected_filter_options[i].text;
        filters[filter_type][filter_option_with_true_value] = true;
    }
    enable_body_scrolling();

    console.log("selected filters", filters);
}

function on_filter_close_button_click() {
    close_filter_dialog_preview();
}

function on_filters_button_click() {
    const filter_dialog = document.getElementsByClassName("filter-dialog")[0];
    filter_dialog.style.display = "block";
    disable_body_scrolling();
}

function on_filter_option_click(event) {
    if (event.target.classList.contains("selected-filter-option"))
        event.target.classList.remove("selected-filter-option");
    else
        event.target.classList.add("selected-filter-option");
}

function on_filter_section_clear_button_click(event) {
    clicked_clear_button = event.target.dataset.clearButtonOf;
    filter_options_to_clear = document.getElementsByClassName(clicked_clear_button);
    for (let i = 0; i < filter_options_to_clear.length; i++) {
        filter_options_to_clear[i].classList.remove("selected-filter-option");
    }
}

function on_filter_container_click(event) {
    const filter_main = document.getElementsByClassName("filter-main")[0];
    if (!filter_main.contains(event.target))
        close_filter_dialog_preview();
}

function register_filter_close_button_click_handler() {
    const filter_close_button = document.getElementsByClassName("filter-close-button")[0];
    filter_close_button.addEventListener("click", on_filter_close_button_click);
}

function register_filters_button_click_handler() {
    const filters_button = document.getElementsByClassName("filters-button")[0];
    filters_button.addEventListener("click", on_filters_button_click);
}

function register_filter_option_button_click_handler() {
    const option = document.getElementsByClassName("option");
    for (let i = 0; i < option.length; i++) {
        option[i].addEventListener("click", on_filter_option_click);
    }
}

function register_clear_button_click_handler() {
    const filter_section_clear_button = document.getElementsByClassName("filter-section-clear-button");
    for (let i = 0; i < filter_section_clear_button.length; i++) {
        filter_section_clear_button[i].addEventListener("click", on_filter_section_clear_button_click);
    }
}

function register_filter_container_click_handler() {
    const filter_container = document.getElementsByClassName("filter-ctr")[0];
    filter_container.addEventListener("click", on_filter_container_click)
}

function add_filter_item_title(key, value) {
    filter_main_ctr = document.getElementsByClassName("filter-main-ctr")[0];
    let options_string = ""
    Object.keys(value).forEach((filter_option) => {
        options_string += '<a class="option ' + key + '" href="#">' + filter_option + '</a>';
    })
    filter_main_ctr.innerHTML += '<div class="filter-type"><p class="filter-type-title">' + key + '</p>' +
        '<a class="filter-section-clear-button" data-clear-button-of="' + key + '" href="#">Clear</a>' +
        '</div>' +
        '<div class="filter-options" data-options-for="' + key + '">' + options_string + '</div>';
}

function add_filter_types() {
    Object.entries(filters).forEach(([key, value]) => {
        add_filter_item_title(key, value);
    })
}

function setup_filter_ui() {
    register_filters_button_click_handler();
    add_filter_types();
    register_filter_close_button_click_handler();
    register_filter_option_button_click_handler();
    register_clear_button_click_handler();
    register_filter_container_click_handler();
}

const DEFAULT_SORT_BY = {
    "Title A-Z": true,
    "Title Z-A": false,
    "Date Available": false
}

let sort_by = cloneObject(DEFAULT_SORT_BY); //this is the global variable to be used for search results

function on_sort_by_button_click() {
    const sort_by_options = document.getElementsByClassName("sort-by-option");
    for (let i = 0; i < sort_by_options.length; i++) {
        const selected_button = sort_by_options[i].text;
        if (sort_by[selected_button] == true) {
            sort_by_options[i].classList.add("selected-sort-by-option");
        }
        else {
            sort_by_options[i].classList.remove("selected-sort-by-option");
        }
    }
    const sort_by_dialog = document.getElementsByClassName("sort-by-dialog")[0];
    sort_by_dialog.style.display = "block";
    disable_body_scrolling();
}

function on_sort_by_option_click(event) {
    const sort_by_options = document.getElementsByClassName("sort-by-option");
    for (let i = 0; i < sort_by_options.length; i++)
        sort_by_options[i].classList.remove("selected-sort-by-option");
    event.target.classList.add("selected-sort-by-option");
}

function close_sort_by_dialog_preview() {
    const sort_by_dialog = document.getElementsByClassName("sort-by-dialog")[0];
    sort_by_dialog.style.display = "none";

    for (let key in sort_by) {
        sort_by[key] = false;
    }

    const selected_sort_by_option = document.getElementsByClassName("selected-sort-by-option")[0];
    sort_by_option_with_true_value = selected_sort_by_option.text;
    sort_by[sort_by_option_with_true_value] = true;

    enable_body_scrolling();

    console.log("selected sortby options", sort_by)
}

function on_sort_by_close_button_click() {
    close_sort_by_dialog_preview();
}

function on_sort_by_container_click(event) {
    const sort_by_main = document.getElementsByClassName("sort-by-main")[0];
    if (!sort_by_main.contains(event.target))
        close_sort_by_dialog_preview();
}

function register_sort_by_button_click_handler() {
    const sort_by_button = document.getElementsByClassName("sort-by-button")[0];
    sort_by_button.addEventListener("click", on_sort_by_button_click);
}

function register_sort_by_option_button_click_handler() {
    const option = document.getElementsByClassName("sort-by-option");
    for (let i = 0; i < option.length; i++) {
        option[i].addEventListener("click", on_sort_by_option_click);
    }
}

function register_sort_by_close_button_click_handler() {
    const sort_by_close_button = document.getElementsByClassName("sort-by-close-button")[0];
    sort_by_close_button.addEventListener("click", on_sort_by_close_button_click);
}

function register_sort_by_container_click_handler() {
    const sort_by_container = document.getElementsByClassName("sort-by-ctr")[0];
    sort_by_container.addEventListener("click", on_sort_by_container_click);
}

function add_sort_by_options() {
    const sort_by_options_container = document.getElementsByClassName("sort-by-options")[0];
    const sort_by_options = Object.keys(sort_by)
    for (let i = 0; i < sort_by_options.length; i++) {
        sort_by_options_container.innerHTML += `<a class="sort-by-option" href="#">${sort_by_options[i]}</a>`;
    }
}

function setup_sort_by_ui() {
    register_sort_by_button_click_handler();
    add_sort_by_options();
    register_sort_by_option_button_click_handler();
    register_sort_by_close_button_click_handler();
    register_sort_by_container_click_handler();
}

function on_page_load() {
    on_page_load_common();
    fetch_books();
    // setup_filter_ui();
    setup_sort_by_ui();
}

window.onload = on_page_load;
