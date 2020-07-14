<?php
 
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use App\File;
use Symfony\Component\HttpKernel\Tests\Debug\FileLinkFormatterTest;
use Validator;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManagerStatic as Image;
 
class FilesController extends Controller
{
    /**
     * Load Files View
     *
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function files()
    {
        return view('files');
    }
 
    /**
     * List Uploaded files
     *
     * @return array
     */
    public function listFiles()
    {
        return ['files' => File::all()];
    }
 
 
    /**
     * Upload new File
     *
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */

    public function uploadGeoFIle(Request $request)
    {   

        try{

         $targetFile = str_replace(" ", "_", $request->input('nom')); 
         //$path = $request->input('path');
         //$targetFile = $request->input('path');
         $sourceFile = $request->file('image_file');
         return $request->input('nom');
        $disk = Storage::disk('public');

        $disk->put($targetFile, fopen($sourceFile, 'r+'));

        /*if (Storage::exists('file.jpg'))
        {
            //
        }*/

        return response()->json(['errors' => [],'status' => true,'nom_img' =>  'assets/admin/images/'.$targetFile], 200);

        }catch(\Exception $e){
            
            return $e;
        }
    }




    /*public function uploads(Request $request) 
    {
       $a = $request->input('nombre_images');
        $path = $request->input('path');

        $noms_img = array(); 
        foreach ( (array) json_decode($a) as $key) { 
            
            $nom_img = str_replace(" ", "_", $key->nom); 
            $request->file($key->appendId)->move(__DIR__ .$path, $nom_img);
            array_push($noms_img, $nom_img);
        }
      //  return $noms_img;
        
 
        return response()->json(['errors' => [],'status' => true,'nom_img' =>  $noms_img,'nombre' => $request->input('nombre')], 200);
    }*/


    public function upload(Request $request)
    {
        
        $path = $request->input('path');
        $pathBd = $request->input('pathBd');

        $image = $request->file('image_file');

        $largeur = $request->input('largeur',null);
        $lomguer = $request->input('lomguer',null);
        $extension = $image->getClientOriginalExtension();

        

         if ($extension != 'svg' && $extension != 'zip' && $extension != 'json' && $extension != 'geojson' && $largeur) { 
            $image_resize = Image::make($image->getRealPath());

           
            $image_resize->resize( $lomguer,  $largeur); //80 80 // 250 90
           

            $nom_img = str_replace(" ", "_", $request->input('nom')); 

            $image_resize->save(public_path($pathBd.$nom_img));
            // $request->file('image_file')->move(__DIR__ .$path, $nom_img);

        }else{

             $path = $request->input('path');
            $pathBd = $request->input('pathBd');

      
            $nom_img = $request->input('nom'); 
            $request->file('image_file')->move(public_path().'/'.$pathBd,$nom_img); 

        }
        return response()->json(['errors' => [],'status' => true,'nom_img' =>  $pathBd.$nom_img], 200);
    }


     public function uploads(Request $request) 
    {
       $a = $request->input('nombre_images');
        $path = $request->input('path');
         $pathBd = $request->input('pathBd');
        $largeur = $request->input('largeur');
        $lomguer = $request->input('lomguer');

        $noms_img = array(); 

            foreach ( (array) json_decode($a) as $key) {

                $image = $request->file($key->appendId);

                $extension = $image->getClientOriginalExtension();

                if ($extension != 'svg') {
                    $image_resize = Image::make($image->getRealPath());

                    $image_resize->resize( $lomguer,  $largeur); //80 80 // 250 90
                

                    $nom_img = str_replace(" ", "_", $key->nom); 

                    $image_resize->save(public_path($pathBd.$nom_img));

                // $request->file($key->appendId)->move(__DIR__ .$path, $nom_img);
                    array_push($noms_img, $nom_img);
                }else{
                    $nom_img = str_replace(" ", "_", $key->nom); 
                    $request->file($key->appendId)->move(__DIR__ .$path, $nom_img);
                    array_push($noms_img, $nom_img);
                }
            }

 
        return response()->json(['errors' => [],'status' => true,'nom_img' =>  $noms_img,'nombre' => $request->input('nombre')], 200);
    }

 
    /**
     * Delete existing file from the server
     *
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete(Request $request)
    {
        Storage::delete(__DIR__ . '/../../../image_uploads/' . $request->input('id'));
 
        File::find($request->input('id'))->delete();
 
        return response()->json(['errors' => [], 'message' => 'File Successfully deleted!', 'status' => 200], 200);
    }
}