<?php
$revision = rand(1, 1000000);
$title = 'Online графический растровый редактор';
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title><?= $title ?></title>
        <link type="text/css" href="./styles/main.css?<?=$revision?>" rel="stylesheet">
        <link type="text/css" href="./styles/jquery-ui.css" rel="stylesheet">
    </head>
    <body>
        <h1><?= $title ?></h1>

        <main>
            <!-- ~~~~~~~~ Блок редактора ~~~~~~~~ -->
            <div class="web_paint"></div>
            <!-- ~~~~~~~~ \Блок редактора ~~~~~~~~ -->
        </main>
        

        <!-- ~~~~~~~~ Скрипты ~~~~~~~~ -->
        <script type="text/javascript" src="./js/jquery.min.js"></script>
        <script type="text/javascript" src="./js/jquery-ui.js"></script>
        <script type="text/javascript" src="./js/jpaint.js?<?=$revision?>"></script>
        <script type="text/javascript">
            $( document ).ready(function() {
                var myPaint = new Paint( $('.web_paint') );
            });
        </script>
        <!-- ~~~~~~~~ \Скрипты ~~~~~~~~ -->
    </body>
</html>
