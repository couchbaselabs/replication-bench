function(doc) { 
      emit(parseInt(doc.test_label.split('d',2)[0]), doc.time_to_master); 
}