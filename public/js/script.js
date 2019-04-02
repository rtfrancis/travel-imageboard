Vue.component("upload-modal", {
    props: ["id"],
    data: function() {
        return {
            imgFormInfo: {
                title: "",
                description: "",
                username: "",
                img: null
            },
            images: [],
            passError: null,
            infoIncomplete: null,
            fileMissing: null
        };
    },
    template: "#main-upload",
    methods: {
        selectFile: function(e) {
            this.imgFormInfo.img = e.target.files[0];
        },
        closeUpload: function() {
            this.$emit("close");
        },
        uploadImage: function(e) {
            var me = this;
            e.preventDefault();
            const fd = new FormData();
            fd.append("title", this.imgFormInfo.title);
            fd.append("description", this.imgFormInfo.description);
            fd.append("username", this.imgFormInfo.username);
            fd.append("password", this.imgFormInfo.password)
            fd.append("file", this.imgFormInfo.img);
                if(this.imgFormInfo.title && this.imgFormInfo.description && this.imgFormInfo.username){
                    if(this.imgFormInfo.img){
                        axios
                            .post("/upload", fd)
                            .then(result => {
                                console.log(result);
                                if(result.data.passError){
                                    me.passError = true;
                                } else {
                                    me.$emit("uploaded", result.data);
                                }
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                    } else {
                        me.fileMissing = true
                    }

                }else{
                    me.infoIncomplete = true
                }
        }
    }
});

// IMAGE MODAL =========================================

Vue.component("image-modal", {
    props: ["id"],
    data: function() {
        return {
            image: {
                title: "",
                description: "",
                username: "",
                url: "",
                created_at: new Date(""),
                id: null
            },
            comment: "",
            comments: [],
            commentInfo: {}
        };
    },
    mounted: function() {
        var named = this;
        axios.get("/images/" + this.id).then(function(response) {
            named.image = response.data;
            axios
                .get("/comments/" + named.id)
                .then(function(results) {
                    named.comments = results.data;
                })
                .catch(function(err) {
                    console.log(err);
                });
        });
    },
    template: "#main-modal",
    methods: {
        where: function() {
            this.$emit("log");
        },
        closeMe: function() {
            this.$emit("close", this.id);
        },
        commentSubmit: function() {
            let self = this;
            axios
                .post("/comments", {
                    comment: this.commentInfo.comment,
                    username: this.commentInfo.username,
                    image_id: this.id
                })
                .then(function(result) {
                    self.comments.unshift(result.data);
                    self.commentInfo.comment = "";
                    self.commentInfo.username = "";
                })
                .catch(function(err) {
                    console.log(err);
                });
        }
    },
    watch: {
        id: function() {
            if (isNaN(this.id)) {
                return;
            }
            var self = this;
            axios.get("/images/" + this.id).then(function(resp) {
                if (!resp.data.success) {
                    self.$emit("close");
                } else {
                    self.image = resp.data.image;

                    axios
                        .get("/comments/" + self.id)
                        .then(function(resp) {
                            self.comments = resp.data.comments;
                        })
                        .catch(function(err) {
                            console.log(err);
                        });
                }
            });
        }
    }
});

// MAIN VIEW =================================

new Vue({
    el: "#main",
    data: {
        images: [],
        more: false,
        count: null,
        currentImageId: location.hash.slice(1) || null,
        imgFormInfo: {
            title: "",
            description: "",
            username: "",
            password: "",
            img: null
        },
        uploadPositive: false
    },
    mounted: function() {
        var me = this;
        axios.get("/images").then(function(resp) {
            console.log(resp.data.count);
            if(resp.data.count >= 6){
                me.more = true
            }
            me.images = resp.data.images;
            me.count = resp.data.count;
        });
        window.addEventListener("hashchange", function() {
            me.currentImageId = location.hash.slice(1);
        });
    },
    methods: {
        where: function() {
            console.log(this.images);
        },
        uploadModal: function() {
            this.uploadPositive = true;
        },
        getId: function(e) {
            this.currentImageId = e;
        },
        closeMe: function() {
            location.hash = "";
        },
        closeUpload: function() {
            this.uploadPositive = false;
        },
        selectFile: function(e) {
            this.imgFormInfo.img = e.target.files[0];
        },
        addNewImage: function(image) {
            this.images.unshift(image.img);
            this.uploadPositive = false;
            this.count++;
        },
        getMoreImages: function() {
            var self = this;
            var newId = this.images[this.images.length - 1];
            axios.get("/moreimages/" + newId.id).then(function(results) {
                self.images = [...self.images, ...results.data];
                console.log(self.images.length);
                if (self.images.length == self.count) {
                    var moreButton = document.querySelector("#getmore");
                    moreButton.style.display = "none";
                }
            });
        }
    }
});
