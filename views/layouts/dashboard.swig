{% extends 'index.swig' %}
{% block content %}
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="box box-solid">
                <div class="box-body">
                    <ul class="nav nav-pills">
                        <li role="presentation" {% if subMenu == 'users' %}class="active"{% endif %}><a
                                    href="/dashboard">用户管理</a></li>
                        <li role="presentation" {% if subMenu == 'articles' %}class="active"{% endif %}><a
                                    href="/dashboard/articles">文章管理</a></li>
                        <li role="presentation" {% if subMenu == 'tags' %}class="active"{% endif %}><a
                                    href="/dashboard/tags">标签管理</a></li>
                    </ul>
                </div>
            </div>
            <div class="box box-solid box-default">
                <div class="box-header with-border">
                    {% block dashboard-header %}
                    {% endblock %}
                </div>
                <div class="box-body">
                    {% block dashboard-content %}
                    {% endblock %}
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}