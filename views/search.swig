{% extends 'layouts/index.swig' %}
{% block content %}
    <div class="container">
        <div class="row">

            <div class="col-md-9">
                <div class="box box-solid box-default bg-gray-light">
                    <div class="box-body">
                        <i class="fa fa-search"></i> 包含关键字 <span class="text-red h3"><b>{{ key }}</b></span> 的所有文章
                        <small class="text-blue font-12">共{{ articles.length }}篇</small>
                    </div>
                </div>
                <div class="box box-solid box-default">
                    <div class="box-body">
                        <ul class="media-list">
                            {% if articles.length>0 %}
                                {% for article in articles %}
                                    {% include 'layouts/partials/index-item.swig' %}
                                {% endfor %}
                            {% else %}
                                <div class="text-danger text-center">已无更多记录!</div>
                            {% endif %}
                        </ul>
                    </div>
                    <div class="box-footer">

                    </div>
                </div>
            </div>
            <div class="col-md-3">
                {% include 'layouts/sidebar/about.swig' %}
                {% include 'layouts/sidebar/weixin.swig' %}
                {% include 'layouts/sidebar/tags.swig' %}
            </div>
        </div>
    </div>
{% endblock %}