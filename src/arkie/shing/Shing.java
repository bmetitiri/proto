package arkie.shing;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import arkie.sprocket.*;

public class Shing extends Activity {
	@Override public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		Controller main = new Controller(this);
		setContentView(main.getView());

		// TODO: Persistencize
		Tileset tile = main.createTileset(R.drawable.chip, 5, 5);
		main.getView().addSprocket(tile);
	}
}
