<?php 
define('ROOT_DIR', __DIR__);
include_once(ROOT_DIR.'/helpers/debug.php');

class manageImages {
    private $params        = [];
    private $img_directory = '/images/';



    function __construct() {
        $this->params = $_REQUEST;
        $result = [
            'ok'    => false,
            'value' => 'Возвращён пустой ответ'
        ];

        if( !empty($this->params) ) {
            if( !empty($this->params['action']) ) {
                if( method_exists($this, $this->params['action'].'Action') ) {
                    $method = $this->params['action'].'Action';
                    $result = $this->$method();
                }
                else
                    $result['value'] = 'Отсутствует метод "'.$this->params['action'].'"';
            }
            else
                $result['value'] = 'Не указан параметр "action"';
        }
        else {
            $result['value'] = 'Получен пустой запрос';
        }

        die( json_encode($result, true) );
    }



    /**
     * Возвращает список файлов изображений расположенных
     * в директории $this->img_directory
     */
    function getImagesAction() {
        $files = scandir(ROOT_DIR.$this->img_directory);
        $images = [];
        foreach($files as $file) { // Избавляемся от лишнего
            if( preg_match('`\.(png|jpe?g)`i', $file) ) {
                $img = [];
                $img['name']       = $file;
                $img['path']       = $this->img_directory.$file;
                $size              = getimagesize(ROOT_DIR.$img['path']);
                $img['width']      = $size[0]          ?? '';
                $img['height']     = $size[1]          ?? '';
                $img['image_type'] = $size[2]          ?? '';
                $img['bits']       = $size['bits']     ?? '';
                $img['channels']   = $size['channels'] ?? '';
                $img['mime']       = $size['mime']     ?? '';

                array_push($images, $img);
            }
                
        }

        return [
            'ok'    => true,
            'value' => $images
        ];
    }



    /**
     * Проверяет возможное имя файла на существование файла
     * с таким же именем в директории $this->img_directory 
     */
    function checkImageNameAction() {
        $filename = $this->params['filename'] ?? '';
        $result   = file_exists( ROOT_DIR.$this->img_directory.$filename );

        return [
            'ok'    => true,
            'value' => $result
        ];
    }



    /**
     * Сохраняет изображение полученное в формате base64
     * в директории $this->img_directory 
     */
    function saveImageAction() {
        $filename  = $this->params['filename']  ?? '';
        $imgBase64 = $this->params['imgBase64'] ?? '';

        $result = [
            'ok' => false,
            'value' => ''
        ];

        if( !empty($filename) ) {
            if( !empty($imgBase64) ) {
                if( preg_match('`^data:image/([^;]{3,});base64`', $imgBase64, $m) && !empty($m[1]) ) {
                    $imgBase64 = preg_replace('`^data:image/'.$m[1].';base64`', '', $imgBase64);
                    if( !preg_match('`\.'.$m[1].'$`', $filename) )
                        $filename .= '.'.$m[1];

                    $full_filename = ROOT_DIR . $this->img_directory . $filename;

                    if( !file_exists( $full_filename ) ) {
                        if( $f = fopen($full_filename, 'wb') ) {
                            if( fwrite($f, base64_decode($imgBase64)) ) {
                                fclose( $f );
                                $result['ok']    = true;
                                $result['value'] = 'Файл сохранён';
                            }
                            else
                                $result['value'] = 'Не удалось записать файл "'.$filename.'"!';
                        }
                        else
                            $result['value'] = 'Не удалось создать файл "'.$filename.'"!';
                    }
                    else
                        $result['value'] = 'Файл с имененм "'.$filename.'" уже существует!';
                }
                else
                    $result['value'] = 'Неправильное значение изображения!';
            }
            else
                $result['value'] = 'Отправлено пустое значение изображения!';
        }
        else
            $result['value'] = 'Отправлено пустое значение имени файла!';
        
        return $result;
    }
}

$manager = new manageImages();
